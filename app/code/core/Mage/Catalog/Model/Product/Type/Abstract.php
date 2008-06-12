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
 * @package    Mage_Catalog
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */


/**
 * Abstract model for product type implementation
 *
 * @category   Mage
 * @package    Mage_Catalog
 * @author      Magento Core Team <core@magentocommerce.com>
 */
abstract class Mage_Catalog_Model_Product_Type_Abstract
{
    protected $_product;
    protected $_typeId;
    protected $_setAttributes;
    protected $_editableAttributes;
    protected $_isComposite = false;

    /**
     * Specify type instance product
     *
     * @param   Mage_Catalog_Model_Product $product
     * @return  Mage_Catalog_Model_Product_Type_Abstract
     */
    public function setProduct($product)
    {
        $this->_product = $product;
        return $this;
    }

    /**
     * Specify type identifier
     *
     * @param   string $typeId
     * @return  Mage_Catalog_Model_Product_Type_Abstract
     */
    public function setTypeId($typeId)
    {
        $this->_typeId = $typeId;
        return $this;
    }

    /**
     * Retrieve catalog product object
     *
     * @return Mage_Catalog_Model_Product
     */
    public function getProduct()
    {
        return $this->_product;
    }

    /**
     * Get array of product set attributes
     *
     * @return array
     */
    public function getSetAttributes()
    {
        if (is_null($this->_setAttributes)) {
            $attributes = $this->getProduct()->getResource()
                ->loadAllAttributes()
                ->getAttributesByCode();
            $this->_setAttributes = array();
            foreach ($attributes as $attribute) {
                if ($attribute->isInSet($this->getProduct()->getAttributeSetId())) {
                    $attribute->setDataObject($this->getProduct());
                    $this->_setAttributes[$attribute->getAttributeCode()] = $attribute;
                }
            }

            uasort($this->_setAttributes, array($this, 'attributesCompare'));
        }
        return $this->_setAttributes;
    }

    public function attributesCompare($attribute1, $attribute2)
    {
        $sortPath      = 'attribute_set_info/' . $this->getProduct()->getAttributeSetId() . '/sort';
        $groupSortPath = 'attribute_set_info/' . $this->getProduct()->getAttributeSetId() . '/group_sort';

        $sort1 =  ($attribute1->getData($groupSortPath) * 1000) + ($attribute1->getData($sortPath) * 0.0001);
        $sort2 =  ($attribute2->getData($groupSortPath) * 1000) + ($attribute2->getData($sortPath) * 0.0001);

        if ($sort1 > $sort2) {
            return 1;
        } elseif ($sort1 < $sort2) {
            return -1;
        }

        return 0;
    }

    /**
     * Retrieve product type attributes
     *
     * @return array
     */
    public function getEditableAttributes()
    {
        if (is_null($this->_editableAttributes)) {
            $this->_editableAttributes = array();
            foreach ($this->getSetAttributes() as $attributeCode => $attribute) {
                if (!is_array($attribute->getApplyTo())
                    || count($attribute->getApplyTo())==0
                    || in_array($this->getProduct()->getTypeId(), $attribute->getApplyTo())) {
                    $this->_editableAttributes[$attributeCode] = $attribute;
                }
            }
        }
        return $this->_editableAttributes;
    }

    /**
     * Retrieve product attribute by identifier
     *
     * @param   int $attributeId
     * @return  Mage_Eav_Model_Entity_Attribute_Abstract
     */
    public function getAttributeById($attributeId)
    {
        foreach ($this->getSetAttributes() as $attribute) {
            if ($attribute->getId() == $attributeId) {
                return $attribute;
            }
        }
        return null;
    }

    /**
     * Check is virtual product
     *
     * @return bool
     */
    public function isVirtual()
    {
        return false;
    }

    /**
     * Check is product available for sale
     *
     * @return bool
     */
    public function isSalable()
    {
        $salable = $this->getProduct()->getStatus() == Mage_Catalog_Model_Product_Status::STATUS_ENABLED;
        if ($salable && $this->getProduct()->hasData('is_salable')) {
            return $this->getProduct()->getData('is_salable');
        }
        return $salable;
    }

    /**
     * Initialize product(s) for add to cart process
     *
     * @param   Varien_Object $buyRequest
     * @return  unknown
     */
    public function prepareForCart(Varien_Object $buyRequest)
    {
        $product = $this->getProduct();

        // try to add custom options
        $options = $this->_prepareOptionsForCart($buyRequest->getOptions());
        if (is_string($options)) {
            return $options;
        }
        $optionIds = array_keys($options);
        $product->addCustomOption('option_ids', implode(',', $optionIds));
        foreach ($options as $optionId => $optionValue) {
        	$product->addCustomOption('option_'.$optionId, $optionValue);
        }

        // set quantity in cart
        $product->setCartQty($buyRequest->getQty());

        return array($product);
    }

    /**
     * Check custom defined options for product
     *
     * @param   array $options
     * @return  array || string
     */
    protected function _prepareOptionsForCart($options)
    {
        $newOptions = array();
        $optionsCollection = $this->getProduct()
            ->getProductOptionsCollection()
            ->load();
        foreach ($optionsCollection as $_option) {
            if (!isset($options[$_option->getId()]) && $_option->getIsRequire()) {
                return Mage::helper('catalog')->__('Please specify the product required option(s)');
            }
            if ($_option->getGroupByType($_option->getType()) == Mage_Catalog_Model_Product_Option::OPTION_GROUP_TEXT) {
                $options[$_option->getId()] = trim($options[$_option->getId()]);
                if (strlen($options[$_option->getId()]) == 0 && $_option->getIsRequire()) {
                    return Mage::helper('catalog')->__('Please specify the product required option(s)');
                }
                if (strlen($options[$_option->getId()]) > $_option->getMaxCharacters() && $_option->getMaxCharacters() > 0) {
                    return Mage::helper('catalog')->__('Length of text is too long');
                }
                if (strlen($options[$_option->getId()]) == 0) continue;
            }
            if ($_option->getGroupByType($_option->getType()) == Mage_Catalog_Model_Product_Option::OPTION_GROUP_FILE) {

            }
            if ($_option->getGroupByType($_option->getType()) == Mage_Catalog_Model_Product_Option::OPTION_GROUP_DATE) {

            }
            if ($_option->getGroupbyType($_option->getType()) == Mage_Catalog_Model_Product_Option::OPTION_GROUP_SELECT) {
                $valuesCollection = $_option->getOptionValuesByOptionId(
                        $options[$_option->getId()], $this->getProduct()->getStoreId()
                    )->load();
                if ($valuesCollection->count() != count($options[$_option->getId()])) {
                    return Mage::helper('catalog')->__('Please specify the product required option(s)');
                }
            }
            $newOptions[$_option->getId()] = $options[$_option->getId()];
        }

        return $newOptions;
    }

    public function getOrderOptions()
    {
        return array();
    }

    /**
     * Save type related data
     *
     * @return unknown
     */
    public function save()
    {
        return $this;
    }

    /**
     * Check if product is composite (grouped, configurable, etc)
     *
     * @return bool
     */
    public function isComposite()
    {
        return $this->_isComposite;
    }

    /**
     * Default action to get sku of product
     *
     * @return string
     */
    public function getSku()
    {
        return $this->getProduct()->getData('sku');
    }

    /**
     * Default action to get weight of product
     *
     * @return decimal
     */
    public function getWeight()
    {
        return $this->getProduct()->getData('weight');
    }
}