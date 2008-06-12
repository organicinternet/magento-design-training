<?php

class Mage_Oscommerce_Model_Mysql4_Catalog_Url extends Mage_Catalog_Model_Resource_Eav_Mysql4_Url
{
    protected function _getCategories($categoryIds, $storeId = null, $path = null)
    {
        $isActiveAttribute = Mage::getModel('eav/entity_attribute')->loadByCode('catalog_category', 'is_active');
        $categories = array();

        if (!is_array($categoryIds)) {
            $categoryIds = array($categoryIds);
        }

        $select = $this->_getWriteAdapter()->select()
            ->from(array('main_table'=>$this->getTable('catalog/category')), array('main_table.entity_id', 'main_table.parent_id', 'is_active'=>'IFNULL(c.value, d.value)', 'main_table.path'));
        if (is_null($path)) {
            $select->where('main_table.entity_id IN(?)', $categoryIds);
        }
        else {
            $select->where('main_table.path LIKE ?', $path . '%')
                ->order('main_table.path');
        }
        $table = $this->getTable('catalog/category') . '_int';
        $select->joinLeft(array('d'=>$table), "d.attribute_id = '{$isActiveAttribute->getId()}' AND d.store_id = 0 AND d.entity_id = main_table.entity_id", array())
            ->joinLeft(array('c'=>$table), "c.attribute_id = '{$isActiveAttribute->getId()}' AND c.store_id = '{$storeId}' AND c.entity_id = main_table.entity_id", array());

        if (!is_null($storeId)) {
            $rootCategoryPath = $this->getStores($storeId)->getRootCategoryPath();
            $rootCategoryPathLength = strlen($rootCategoryPath);
        }

        $rowSet = $this->_getWriteAdapter()->fetchAll($select);
        foreach ($rowSet as $row) {
            if (!is_null($storeId) && substr($row['path'], 0, $rootCategoryPathLength) != $rootCategoryPath) {
                continue;
            }

            $category = new Varien_Object($row);
            $category->setIdFieldName('entity_id');
            $category->setStoreId($storeId);
            $this->_prepareCategoryParentId($category);

            $categories[$category->getId()] = $category;
        }
        unset($rowSet);

        if (!is_null($storeId) && $categories) {
            foreach (array('name', 'url_key', 'url_path') as $attributeCode) {
                $attributes = $this->_getCategoryAttribute($attributeCode, array_keys($categories), $category->getStoreId());
                foreach ($attributes as $categoryId => $attributeValue) {
                    $categories[$categoryId]->setData($attributeCode, $attributeValue);
                }
            }
        }

        return $categories;
    }
}