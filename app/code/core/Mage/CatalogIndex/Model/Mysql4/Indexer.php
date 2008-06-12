<?php
/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * @category   Mage
 * @package    Mage_CatalogIndex
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */


/**
 * Reindexer resource model
 *
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_CatalogIndex_Model_Mysql4_Indexer extends Mage_Core_Model_Mysql4_Abstract
{
    protected $_attributeCache = array();
    protected $_tierCache = array();
    protected $_insertData = array();
    protected $_tableFields = array();
    protected $_customerGroups = null;

    protected $_minimalPriceData = null;

    const REINDEX_CHILDREN_NONE = 0;
    const REINDEX_CHILDREN_ALL = 1;
    const REINDEX_CHILDREN_CONFIGURABLE = 2;
    const REINDEX_CHILDREN_GROUPED = 3;


    protected function _construct()
    {
        $this->_init('catalog/product', 'entity_id');
    }

    public function clear($eav = true, $price = true, $minimal = true, $finalPrice = true, $tierPrice = true, $products = null, $store = null)
    {
        $suffix = '';
        $tables = array('eav'=>'catalogindex/eav', 'price'=>'catalogindex/price');
        if (!is_null($products)) {
            if ($products instanceof Mage_Catalog_Model_Product) {
                $products = $products->getId();
            } else if (!is_numeric($products) && !is_array($products)) {
                Mage::throwException('Invalid products supplied for indexing');
            }
            $suffix = $this->_getWriteAdapter()->quoteInto('entity_id in (?)', $products);
        }
        if (!is_null($store)) {
            if ($store instanceof Mage_Core_Model_Store) {
                $store = $store->getId();
            } else if ($store instanceof Mage_Core_Model_Mysql4_Store_Collection) {
                $store = $store->getAllIds();
            } else if (is_array($store)) {
                $resultStores = array();
                foreach ($store as $s) {
                    if ($s instanceof Mage_Core_Model_Store) {
                        $resultStores[] = $s->getId();
                    } elseif (is_numeric($s)) {
                        $resultStores[] = $s;
                    }
                }
                $store = $resultStores;
            }


            if ($suffix) {
                $suffix .= ' AND ';
            }
            $suffix .= $this->_getWriteAdapter()->quoteInto('store_id in (?)', $store);

        }

        if ($tierPrice) {
            $tables['tierPrice'] = 'catalogindex/price';
            $tierPrice = array($this->_getAttribute('tier_price', true)->getId());
        }
        if ($finalPrice) {
            $tables['finalPrice'] = 'catalogindex/price';
            $tierPrice = array($this->_getAttribute('price', true)->getId());
        }
        if ($minimal) {
            $tables['minimal'] = 'catalogindex/minimal_price';
        }


        foreach ($tables as $variable=>$table) {
            $variable = $$variable;

            if ($variable === true) {
                $query = "DELETE FROM {$this->getTable($table)} ";
                if ($suffix) {
                    $query .= "WHERE {$suffix}";
                }

                $this->_getWriteAdapter()->query($query);
            } else if (is_array($variable) && count($variable)) {
                $query  = "DELETE FROM {$this->getTable($table)} WHERE ";
                $query .= $this->_getWriteAdapter()->quoteInto("attribute_id in (?)", $variable);
                if ($suffix) {
                    $query .= " AND {$suffix}";
                }

                $this->_getWriteAdapter()->query($query);
            }
        }
    }

    protected function _where($select, $field, $condition)
    {
        if (is_array($condition) && isset($condition['or'])) {
            $select->where("{$field} in (?)", $condition['or']);
        } elseif (is_array($condition)) {
            foreach ($condition as $where)
                $select->where("{$field} = ?", $where);
        } else {
            $select->where("{$field} = ?", $condition);
        }
    }

    public function getProductData($products, $attributeIds, $store){
        $suffixes = array('decimal', 'varchar', 'int', 'text', 'datetime');
        if (!is_array($products)) {
            $products = new Zend_Db_Expr($products);
        }
        $result = array();
        foreach ($suffixes as $suffix) {
            $tableName = "{$this->getTable('catalog/product')}_{$suffix}";
            $condition = "product.entity_id = c.entity_id AND c.store_id = {$store->getId()} AND c.attribute_id = d.attribute_id";
            $defaultCondition = "product.entity_id = d.entity_id AND d.store_id = 0";
            $fields = array('entity_id', 'type_id', 'attribute_id'=>'IFNULL(c.attribute_id, d.attribute_id)', 'value'=>'IFNULL(c.value, d.value)');

            $select = $this->_getReadAdapter()->select()
                ->from(array('product'=>$this->getTable('catalog/product')), $fields)
                ->where('product.entity_id in (?)', $products)
                ->joinRight(array('d'=>$tableName), $defaultCondition, array())
                ->joinLeft(array('c'=>$tableName), $condition, array())
                ->where('c.attribute_id IN (?) OR d.attribute_id IN (?)', $attributeIds);

            $part = $this->_getReadAdapter()->fetchAll($select);

            if (is_array($part)) {
                $result = array_merge($result, $part);
            }
        }

        return $result;
    }

    public function getTierData($products, $store){
        if (!is_array($products)) {
            $products = new Zend_Db_Expr($products);
        }

        $fields = array(
            'entity_id',
            'type_id',
            'c.customer_group_id',
            'c.qty',
            'c.value',
            'c.all_groups',
        );
        $condition = "product.entity_id = c.entity_id";

        $select = $this->_getReadAdapter()->select()
            ->from(array('product'=>$this->getTable('catalog/product')), $fields)
            ->joinLeft(array('c'=>"{$this->getTable('catalog/product')}_tier_price"), $condition, array())
            ->where('product.entity_id in (?)', $products)
            ->where('(c.website_id = ?', $store->getWebsiteId())
            ->orWhere('c.website_id = 0)');

        $part = $this->_getReadAdapter()->fetchAll($select);

        return $part;
    }

    public function getNonSimpleProducts($parentIds, $onlyType = null)
    {
        $select = $this->_getReadAdapter()->select()
            ->from(array('product'=>$this->getTable('catalog/product')), array('product.entity_id', 'product.type_id'))
            ->where('product.entity_id in (?)', $parentIds);

        if (!is_null($onlyType)) {
            $select->where('product.type_id = ?', $onlyType);
        } else {
            $select->where('product.type_id <> ?', Mage_Catalog_Model_Product_Type::TYPE_SIMPLE);
        }

        return $this->_getReadAdapter()->fetchAll($select);
    }

    public function reindexAttributes($products, $attributeIds, $store, $forcedId = null, $table = 'catalogindex/eav', $children = self::REINDEX_CHILDREN_ALL)
    {
        if (is_null($forcedId)) {
            if ($children != self::REINDEX_CHILDREN_NONE) {
                $nonSimple = $this->getNonSimpleProducts($products);
                if ($nonSimple) {
                    foreach ($nonSimple as $parent) {
                        if ($children != self::REINDEX_CHILDREN_ALL && $children != self::REINDEX_CHILDREN_CONFIGURABLE && $parent['type_id'] == Mage_Catalog_Model_Product_Type::TYPE_CONFIGURABLE) {
                        } elseif ($children != self::REINDEX_CHILDREN_ALL && $children != self::REINDEX_CHILDREN_GROUPED && $parent['type_id'] == Mage_Catalog_Model_Product_Type::TYPE_GROUPED) {
                        } else {
                            $childrenIds = $this->getProductChildrenFilter($parent['entity_id'], $parent['type_id'], $store);
                            if ($childrenIds !== false) {
                                $this->reindexAttributes($childrenIds, $attributeIds, $store, $parent['entity_id'], $table);
                            }
                        }
                    }
                }
            }
        }

        $this->_beginInsert($table, array('entity_id', 'attribute_id', 'value', 'store_id'));

        $attributeIndex = $this->getProductData($products, $attributeIds, $store);
        foreach ($attributeIndex as $index) {
            $type = $index['type_id'];
            $id = (is_null($forcedId) ? $index['entity_id'] : $forcedId);

            if ($id && $index['attribute_id'] && $index['value']) {
                if ($this->_getAttribute($index['attribute_id'])->getFrontendInput() == 'multiselect') {
                    $index['value'] = explode(',', $index['value']);
                }

                if (is_array($index['value'])) {
                    foreach ($index['value'] as $value) {
                        $this->_insert($table, array($id, $index['attribute_id'], $value, $store->getId()));
                    }
                } else {
                    $this->_insert($table, array($id, $index['attribute_id'], $index['value'], $store->getId()));
                }
            }
        }

        $this->_commitInsert($table);
    }

    protected function _getAttribute($attributeId, $idIsCode = false)
    {
        $key = $attributeId . '|' . intval($idIsCode);
        if (!isset($this->_attributeCache[$key])) {
            $attribute = Mage::getModel('eav/entity_attribute');
            if ($idIsCode) {
                $attribute->loadByCode('catalog_product', $attributeId);
            } else {
                $attribute->load($attributeId);
            }
            $this->_attributeCache[$key] = $attribute;
        }

        return $this->_attributeCache[$key];
    }

    protected function _getGroups()
    {
        if (is_null($this->_customerGroups)) {
            $this->_customerGroups = Mage::getModel('customer/group')->getCollection();
        }
        return $this->_customerGroups;
    }

    public function reindexTiers($products, $store, $forcedId = null)
    {
        if (is_null($forcedId)) {
            $nonSimple = $this->getNonSimpleProducts($products, Mage_Catalog_Model_Product_Type::TYPE_GROUPED);
            if ($nonSimple) {
                foreach ($nonSimple as $parent) {
                    $childrenIds = $this->getProductChildrenFilter($parent['entity_id'], $parent['type_id'], $store);
                    if ($childrenIds !== false) {
                        $this->reindexTiers($childrenIds, $store, $parent['entity_id']);
                    }
                }
            }
        }

        $attribute = $this->_getAttribute('tier_price', true);

        $this->_beginInsert('catalogindex/price', array('entity_id', 'attribute_id', 'value', 'store_id', 'customer_group_id', 'qty'));
        $attributeIndex = $this->getTierData($products, $store);
        foreach ($attributeIndex as $index) {
            $type = $index['type_id'];
            $id = (is_null($forcedId) ? $index['entity_id'] : $forcedId);
            if ($id && $index['value']) {
                if ($index['all_groups'] == 1) {
                    foreach ($this->_getGroups() as $group) {
                        $this->_insert('catalogindex/price', array($id, $attribute->getId(), $index['value'], $store->getId(), (int) $group->getId(), (int) $index['qty']));
                    }
                } else {
                    $this->_insert('catalogindex/price', array($id, $attribute->getId(), $index['value'], $store->getId(), (int) $index['customer_group_id'], (int) $index['qty']));
                }
            }
        }
        $this->_commitInsert('catalogindex/price');
    }

    public function reindexMinimalPrices($products, $store)
    {
        $this->_beginInsert('catalogindex/minimal_price', array('store_id', 'entity_id', 'customer_group_id', 'value'));
        $this->clear(false, false, true, false, false, $products, $store);
        $withChildren = $this->getNonSimpleProducts($products, Mage_Catalog_Model_Product_Type::TYPE_GROUPED);
        if ($withChildren) {
            foreach ($withChildren as $parent) {
                if (in_array($parent['entity_id'], $products))
                    unset($products[array_search($parent['entity_id'], $products)]);

                $childrenIds = $this->getProductChildrenFilter($parent['entity_id'], $parent['type_id'], $store);
                if ($childrenIds !== false) {
                    $minimal = $this->_getMinimalPrices($childrenIds, $store);
                }
                if (is_array($minimal)) {
                    foreach ($minimal as $price) {
                        $this->_insert('catalogindex/minimal_price', array($store->getId(), $parent['entity_id'], $price['customer_group_id'], $price['minimal_value']));
                    }
                }
            }
        }

        foreach ($products as $product) {
            $minimal = $this->_getMinimalPrices($product, $store);
            if (is_array($minimal)) {
                foreach ($minimal as $price) {
                    $this->_insert('catalogindex/minimal_price', array($store->getId(), $product, $price['customer_group_id'], $price['minimal_value']));
                }
            }
        }

        $this->_commitInsert('catalogindex/minimal_price');
    }

    protected function _getMinimalPrices($products, $store)
    {
        $tierAttribute = $this->_getAttribute('tier_price', true);
        $priceAttribute = $this->_getAttribute('price', true);

        $fields = array('customer_group_id', 'minimal_value'=>'MIN(value)');
        $priceAttributes = array($tierAttribute->getId(), $priceAttribute->getId());

        if ($products instanceof Zend_Db_Select) {
            $productIds = $this->_getReadAdapter()->fetchAll($products);
        }
        elseif (!is_array($products)) {
        	$productIds = array($products);
        }
        else {
            $productIds = $products;
        }


        if (!empty($productIds)) {
            $select = $this->_getReadAdapter()->select()
                ->from(array('base'=>$this->getTable('catalogindex/price')), $fields)
                ->where('base.entity_id in (?)', $productIds)
                ->where('base.attribute_id in (?)', $priceAttributes)
                ->where('base.store_id = ?', $store->getId())
                ->group('base.customer_group_id');
            $data = $this->_getReadAdapter()->fetchAll($select);
        }
        else {
            $data = array();
        }

        $this->setMinimalPriceData($data);
        $eventData = array('indexer'=>$this, 'product_ids'=>$products, 'store'=>$store);
        Mage::dispatchEvent('catalogindex_get_minimal_price', $eventData);
        $data = $this->getMinimalPriceData();

        return $data;
    }

    public function getMinimalPriceData()
    {
        return $this->_minimalPriceData;
    }

    public function setMinimalPriceData($value)
    {
        $this->_minimalPriceData = $value;
    }

    public function reindexPrices($products, $attributeIds, $store)
    {
        $this->reindexAttributes($products, $attributeIds, $store, null, 'catalogindex/price', self::REINDEX_CHILDREN_ALL);
    }

    public function reindexFinalPrices($products, $store, $forcedId = null)
    {
        if (is_null($forcedId)) {
            $nonSimple = $this->getNonSimpleProducts($products, Mage_Catalog_Model_Product_Type::TYPE_GROUPED);
            if ($nonSimple) {
                foreach ($nonSimple as $parent) {
                    $childrenIds = $this->getProductChildrenFilter($parent['entity_id'], $parent['type_id'], $store);
                    if ($childrenIds !== false) {
                        $this->reindexFinalPrices($childrenIds, $store, $parent['entity_id']);
                    }
                }
            }
        }

        $priceAttribute = $this->_getAttribute('price', true);
        $insert = array();
        $this->_beginInsert('catalogindex/price', array('entity_id', 'store_id', 'customer_group_id', 'value', 'attribute_id'));
        foreach ($products as $product) {
            foreach ($this->_getGroups() as $group) {
                $finalPrice = $this->_processFinalPrice($product, $store, $group);

                if (!is_null($forcedId))
                    $product = $forcedId;
                if (false !== $finalPrice && false !== $product && false !== $store->getId() && false !== $group->getId() && false !== $priceAttribute->getId()) {
                    $this->_insert('catalogindex/price', array($product, $store->getId(), $group->getId(), $finalPrice, $priceAttribute->getId()));
                }
            }
        }
        $this->_commitInsert('catalogindex/price');
    }

    protected function _processFinalPrice($productId, $store, $group)
    {
        $basePrice = $this->_getAttributeValue($productId, $store, $this->_getAttribute('price', true));
        $specialPrice = $this->_getAttributeValue($productId, $store, $this->_getAttribute('special_price', true));
        $specialPriceFrom = $this->_getAttributeValue($productId, $store, $this->_getAttribute('special_from_date', true));
        $specialPriceTo = $this->_getAttributeValue($productId, $store, $this->_getAttribute('special_to_date', true));
        $wId = $store->getWebsiteId();
        $gId = $group->getId();

        return Mage_Catalog_Model_Product_Price::calculatePrice($basePrice, $specialPrice, $specialPriceFrom, $specialPriceTo, false, $wId, $gId, $productId);
/*
        $finalPrice = $basePrice;

        $today = floor(time()/86400)*86400;
        $from = floor(strtotime($specialPriceFrom)/86400)*86400;
        $to = floor(strtotime($specialPriceTo)/86400)*86400;

        if ($specialPrice !== false) {
            if ($specialPriceFrom && $today < $from) {
            } elseif ($specialPriceTo && $today > $to) {
            } else {
               $finalPrice = min($finalPrice, $specialPrice);
            }
        }
        $date = mktime(0,0,0);

        $rulePrice = Mage::getResourceModel('catalogrule/rule')->getRulePrice($date, $wId, $gId, $productId);
        if ($rulePrice !== false) {
            $finalPrice = min($finalPrice, $rulePrice);
        }
        $finalPrice = max($finalPrice, 0);
        return $finalPrice;
*/
    }

    protected function _getAttributeValue($productId, $store, $attribute)
    {
        $tableName = "{$this->getTable('catalog/product')}_{$attribute->getBackendType()}";

        $condition = "product.entity_id = c.entity_id AND c.store_id = {$store->getId()}";
        $defaultCondition = "product.entity_id = d.entity_id AND d.store_id = 0";

        $select = $this->_getReadAdapter()->select()
            ->from(array('product'=>$this->getTable('catalog/product')), 'IFNULL(c.value, d.value)')
            ->where('product.entity_id = ?', $productId)
            ->joinLeft(array('c'=>$tableName), $condition, array())
            ->joinLeft(array('d'=>$tableName), $defaultCondition, array())
            ->where('IFNULL(c.attribute_id, d.attribute_id) = ?', $attribute->getId());


        return $this->_getReadAdapter()->fetchOne($select);
    }

    public function getProductChildrenFilter($id, $type, $store = null)
    {
        $select = $this->_getReadAdapter()->select();
        switch ($type){
            case Mage_Catalog_Model_Product_Type::TYPE_GROUPED:
                $table = $this->getTable('catalog/product_link');
                $field = 'l.linked_product_id';
                $searchField = 'l.product_id';
                $select->where("l.link_type_id = ?", Mage_Catalog_Model_Product_Link::LINK_TYPE_GROUPED);
                break;

            case Mage_Catalog_Model_Product_Type::TYPE_CONFIGURABLE:
                $table = $this->getTable('catalog/product_super_link');
                $field = 'l.product_id';
                $searchField = 'l.parent_id';
                break;

            default:
                return false;
        }

        $select->from(array('l'=>$table), $field)
            ->where("$searchField = ?", $id);

        if ($type == Mage_Catalog_Model_Product_Type::TYPE_CONFIGURABLE) {
            $statusAttribute = $this->_getAttribute('status', true);

            $select->joinLeft(array('s'=>$this->getTable('cataloginventory/stock_item')), "s.product_id={$field}", array());
            $select->where('s.is_in_stock = 1');

            $select->joinLeft(array('a'=>$this->getTable('catalog/product') . '_int'), "a.entity_id={$field} AND a.store_id = {$store->getId()} AND a.attribute_id = {$statusAttribute->getId()}", array());
            $select->joinLeft(array('d'=>$this->getTable('catalog/product') . '_int'), "d.entity_id={$field} AND d.store_id = 0 AND d.attribute_id = {$statusAttribute->getId()}", array());
            $select->where('a.value = 1 OR (a.value is null AND d.value = 1)');
        }

        return $select;
    }

    protected function _beginInsert($table, $fields){
        $this->_tableFields[$table] = $fields;
    }

    protected function _commitInsert($table, $forced = true){
        if (isset($this->_insertData[$table]) && count($this->_insertData[$table]) && ($forced || count($this->_insertData[$table]) >= 100)) {
            $query = 'INSERT INTO ' . $this->getTable($table) . ' (' . implode(', ', $this->_tableFields[$table]) . ') VALUES ';
            $separator = '';
            foreach ($this->_insertData[$table] as $row) {
                $rowString = $this->_getWriteAdapter()->quoteInto('(?)', $row);
                $query .= $separator . $rowString;
                $separator = ', ';
            }

            $this->_getWriteAdapter()->query($query);
            $this->_insertData[$table] = array();
        }
    }

    protected function _insert($table, $data) {
        $this->_insertData[$table][] = $data;
        $this->_commitInsert($table, false);
    }
}