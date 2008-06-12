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
 * @package    Mage_Bundle
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * Bundle Type Model
 *
 * @category    Mage
 * @package     Mage_Bundle
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Bundle_Model_Product_Type extends Mage_Catalog_Model_Product_Type_Abstract
{
    protected $_isComposite = true;

    protected $_optionsCollection;
    protected $_selectionsCollection;
    protected $_storeFilter = null;

    protected $_usedProductsIds = null;
    protected $_usedProducts = null;

    /**
     * Return product sku based on sku_type attribute
     *
     * @return string
     */
    public function getSku()
    {
        if ($this->getProduct()->getData('sku_type')) {
            return $this->getProduct()->getData('sku');
        } else {
            $skuParts = array($this->getProduct()->getData('sku'));

            if ($this->getProduct()->hasCustomOptions()) {
                $customOption = $this->getProduct()->getCustomOption('bundle_selection_ids');
                $selectionIds = unserialize($customOption->getValue());
                $selections = $product->getTypeInstance()->getSelectionsByIds($selectionIds);
                foreach ($selections->getItems() as $selection) {
                    $skuParts[] = $selection->getSku();
                }
            }

            return implode('-', $skuParts);
        }
    }

    /**
     * Return product weight based on weight_type attribute
     *
     * @return decimal
     */
    public function getWeight()
    {
        if ($this->getProduct()->getData('weight_type')) {
            return $this->getProduct()->getData('weight');
        } else {
            $weight = 0;

            if ($this->getProduct()->hasCustomOptions()) {
                $customOption = $this->getProduct()->getCustomOption('bundle_selection_ids');
                $selectionIds = unserialize($customOption->getValue());
                $selections = $product->getTypeInstance()->getSelectionsByIds($selectionIds);
                foreach ($selections->getItems() as $selection) {
                    $weight += $selection->getWeight();
                }
            }

            return $weight;
        }
    }

    public function save()
    {
        parent::save();

        if ($options = $this->getProduct()->getBundleOptionsData()) {
            foreach ($options as $key => $option) {
                if (!$option['option_id']) {
                    unset($option['option_id']);
                }

                $optionModel = Mage::getModel('bundle/option')
                    ->setData($option)
                    ->setParentId($this->getProduct()->getId())
                    ->setStoreId($this->getProduct()->getStoreId());

                $optionModel->isDeleted((bool)$option['delete']);
                $optionModel->save();

                $options[$key]['option_id'] = $optionModel->getOptionId();
            }

            if ($selections = $this->getProduct()->getBundleSelectionsData()) {
                foreach ($selections as $index => $group) {
                    foreach ($group as $key => $selection) {
                        if (!$selection['selection_id']) {
                            unset($selection['selection_id']);
                        }

                        if (!isset($selection['is_default'])) {
                            $selection['is_default'] = 0;
                        }

                        $selectionModel = Mage::getModel('bundle/selection')
                            ->setData($selection)
                            ->setOptionId($options[$index]['option_id']);

                        $selectionModel->isDeleted((bool)$selection['delete']);
                        $selectionModel->save();

                        $selection['selection_id'] = $selectionModel->getSelectionId();
                    }
                }
            }
        }

        return $this;
    }

    /**
     * Retrieve bundle options items
     *
     * @return array
     */
    public function getOptions()
    {
        return $this->getOptionsCollection()->getItems();
    }

    /**
     * Retrieve bundle options ids
     *
     * @return array
     */
    public function getOptionsIds()
    {
        return $this->getOptionsCollection()->getAllIds();
    }

    /**
     * Retrieve bundle option collection
     *
     * @return Mage_Bundle_Model_Mysql4_Option_Collection
     */
    public function getOptionsCollection()
    {
        if (!$this->_optionsCollection) {
            $this->_optionsCollection = Mage::getModel('bundle/option')->getResourceCollection()
                ->setProductIdFilter($this->getProduct()->getId())
                ->setPositionOrder()
                ->joinValues($this->getStoreFilter());
        }
        return $this->_optionsCollection;
    }

    /**
     * Retrive bundle selections collection based on used options
     *
     * @param array $optionIds
     * @return Mage_Bundle_Model_Mysql4_Selection_Collection
     */
    public function getSelectionsCollection($optionIds)
    {
        if (!$this->_selectionsCollection) {
            $this->_selectionsCollection = Mage::getResourceModel('bundle/selection_collection')
                ->addAttributeToSelect('*')
                ->setOptionIdsFilter($optionIds);
        }
        return $this->_selectionsCollection;
    }

    /**
     * Checking if we can sale this bundle
     *
     * @return bool
     */
    public function isSalable()
    {
        if (!parent::isSalable()) {
            return false;
        }
        return true;
        /**
         * @todo check all selection for available
         */
    }

    /**
     * Retrive store filter for associated products
     *
     * @return int|Mage_Core_Model_Store
     */
    public function getStoreFilter()
    {
        return $this->_storeFilter;
    }

    /**
     * Set store filter for associated products
     *
     * @param $store int|Mage_Core_Model_Store
     * @return Mage_Catalog_Model_Product_Type_Configurable
     */
    public function setStoreFilter($store=null) {
        $this->_storeFilter = $store;
        return $this;
    }

    /**
     * Initialize product(s) for add to cart process
     *
     * @param   Varien_Object $buyRequest
     * @return  unknown
     */
    public function prepareForCart(Varien_Object $buyRequest)
    {
        $result = parent::prepareForCart($buyRequest);
        if (is_string($result)) {
            return $result;
        }

        if ($options = $buyRequest->getBundleOption()) {
            $qtys = $buyRequest->getBundleOptionQty();

            $optionIds = array_keys($options);

            $optionsCollection = $this->getOptionsByIds($optionIds);
            foreach ($optionsCollection->getItems() as $option) {
                if ($option->getRequired() && !isset($options[$option->getId()])) {
                    return Mage::helper('bundle')->__('Required options not selected.');
                }
            }

            $selectionIds = array();
            foreach ($options as $optionId => $selectionId) {
                if (!is_array($selectionId)) {
                    if ($selectionId != 'none' && $selectionId != '') {
                        $selectionIds[] = $selectionId;
                    }
                } else {
                    foreach ($selectionId as $id) {
                        if ($id != 'none' && $id != '') {
                            $selectionIds[] = $id;
                        }
                    }
                }
            }
            $selectionsCollection = $this->getSelectionsByIds($selectionIds);

            foreach ($selectionsCollection->getItems() as $selection) {
                if ($selection->getSelectionCanChangeQty() && isset($qtys[$selection->getOptionId()])) {
                    $qty = $qtys[$selection->getOptionId()] > 0 ? $qtys[$selection->getOptionId()] : 1;
                } else {
                    $qty = $selection->getSelectionQty() ? $selection->getSelectionQty() : 1;
                }
                $result[0]->addCustomOption('selection_qty_' . $selection->getSelectionId(), $qty, $selection);
                if ($customOption = $result[0]->getCustomOption('product_qty_' . $selection->getId())) {
                    $customOption->setValue($customOption->getValue() + $qty);
                }
                $result[0]->addCustomOption('product_qty_' . $selection->getId(), $qty, $selection);
            }

            $result[0]->addCustomOption('bundle_option_ids', serialize($optionIds));
            $result[0]->addCustomOption('bundle_selection_ids', serialize($selectionIds));

            return $result;
        }
        return Mage::helper('catalog')->__('Please specify the bundle option(s)');
    }

    /**
     * Retrieve bundle selections collection based on ids
     *
     * @param array $selectionIds
     * @return Mage_Bundle_Model_Mysql4_Selection_Collection
     */
    public function getSelectionsByIds($selectionIds)
    {
            return Mage::getResourceModel('bundle/selection_collection')
                ->addAttributeToSelect('*')
                ->setSelectionIdsFilter($selectionIds);
    }

    /**
     * Retrieve bundle options collection based on ids
     *
     * @param array $optionIds
     * @return Mage_Bundle_Model_Mysql4_Option_Collection
     */
    public function getOptionsByIds($optionIds)
    {
            return Mage::getModel('bundle/option')->getResourceCollection()
                ->setProductIdFilter($this->getProduct()->getId())
                ->joinValues(Mage::app()->getStore()->getId())
                ->setIdFilter($optionIds);
    }
}
