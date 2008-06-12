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
 * Bundle Price Model
 *
 * @category    Mage
 * @package     Mage_Bundle
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Bundle_Model_Product_Price extends Mage_Catalog_Model_Product_Type_Price
{
    /**
     * Return product base price
     *
     * @return string
     */
    public function getPrice($product)
    {
        if ($product->getPriceType()) {
            return $product->getData('price');
        } else {
            return 0;
        }
    }

    /**
     * Get product final price
     *
     * @param   double $qty
     * @param   Mage_Catalog_Model_Product $product
     * @return  double
     */
    public function getFinalPrice($qty=null, $product)
    {
        //if (is_null($qty) && !is_null($product->getCalculatedFinalPrice())) {
        //    return $product->getCalculatedFinalPrice();
        //}

        $finalPrice = $product->getPrice();
        if ($product->hasCustomOptions()) {
            $customOption = $product->getCustomOption('bundle_option_ids');
            $optionIds = unserialize($customOption->getValue());
            $customOption = $product->getCustomOption('bundle_selection_ids');
            $selectionIds = unserialize($customOption->getValue());
            $selections = $product->getTypeInstance()->getSelectionsByIds($selectionIds);
            foreach ($selections->getItems() as $selection) {
                $selectionQty = $product->getCustomOption('selection_qty_' . $selection->getSelectionId());
                $finalPrice = $finalPrice + $this->getSelectionFinalPrice($product, $selection, $selectionQty->getValue());
            }
        } else {
            foreach ($this->getOptions($product) as $option) {
                foreach ($option->getSelections() as $selection) {
                    if ($selection->getIsDefault()) {
                        $finalPrice = $finalPrice + $this->getSelectionFinalPrice($product, $selection);
                    }
                }
            }
        }
        $finalPrice = $this->_applyTierPrice($product, $qty, $finalPrice);
        $finalPrice = $this->_applySpecialPrice($product, $finalPrice);

        $product->setFinalPrice($finalPrice);
        Mage::dispatchEvent('catalog_product_get_final_price', array('product'=>$product));
        return max(0, $product->getData('final_price'));
    }

    /**
     * Calculate Minimal price of bundle (counting all required options)
     *
     * @param Mage_Catalog_Model_Product $product
     * @return decimal
     */
    public function getMinimalPrice($product)
    {
        $price = $product->getPrice();

        foreach ($this->getOptions($product) as $option) {
            if ($option->getRequired()) {
                $selectionPrices = array();
                foreach ($option->getSelections() as $selection) {
                    if ($selection->getSelectionCanChangeQty()) {
                        $qty = 1;
                    } else {
                        $qty = $selection->getSelectionQty();
                    }
                    $selectionPrices[] = $this->getSelectionFinalPrice($product, $selection);
                }
                $price += min($selectionPrices);
            }
        }
        return $this->_applySpecialPrice($product, $price);
    }

    /**
     * Calculate maximal price of bundle
     *
     * @param Mage_Catalog_Model_Product $product
     * @return decimal
     */
    public function getMaximalPrice($product)
    {
        $price = $product->getPrice();

        foreach ($this->getOptions($product) as $option) {
            $selectionPrices = array();
            foreach ($option->getSelections() as $selection) {
                $selectionPrices[] = $this->getSelectionFinalPrice($product, $selection);
            }
            if ($option->isMultiSelection()) {
                $price += array_sum($selectionPrices);
            } else {
                $price += max($selectionPrices);
            }
        }
        return $this->_applySpecialPrice($product, $price);
    }

    /**
     * Get Options with attached Selections collection
     *
     * @param Mage_Catalog_Model_Product $product
     * @return Mage_Bundle_Model_Mysql4_Option_Collection
     */
    public function getOptions($product)
    {
        $product->getTypeInstance()->setStoreFilter($product->getStoreId());

        $optionCollection = $product->getTypeInstance()->getOptionsCollection();

        $selectionCollection = $product->getTypeInstance()->getSelectionsCollection(
                $product->getTypeInstance()->getOptionsIds()
            );

        return $optionCollection->appendSelections($selectionCollection);
    }

    /**
     * Calculate final price of selection
     *
     * @param Mage_Catalog_Model_Product $product
     * @param Mage_Catalog_Model_Product $selection
     * @param decimal $qty
     * @return decimal
     */
    public function getSelectionFinalPrice($product, $selection, $qty = null)
    {
        if (is_null($qty)) {
            $qty = $selection->getSelectionQty();
        }

        if ($product->getPriceType() == Mage_Bundle_Block_Adminhtml_Catalog_Product_Edit_Tab_Attributes_Extend::DYNAMIC){
            return $selection->getFinalPrice($qty)*$qty;
        } else {
            if ($selection->getSelectionPriceType()) {
                return ($product->getPrice()*$selection->getSelectionPriceValue()/100)*$qty;
            } else {
                return $selection->getSelectionPriceValue()*$qty;
            }
        }
    }

    /**
     * Apply tier price for bundle
     *
     * @param   Mage_Catalog_Model_Product $product
     * @param   double $qty
     * @param   double $finalPrice
     * @return  double
     */
    protected function _applyTierPrice($product, $qty, $finalPrice)
    {
        if (is_null($qty)) {
            return $finalPrice;
        }

        $tierPrice  = $product->getTierPrice($qty);
        if (is_numeric($tierPrice)) {
            $tierPrice = $finalPrice - ($finalPrice*$tierPrice)/100;
            $finalPrice = min($finalPrice, $tierPrice);
        }
        return $finalPrice;
    }

    /**
     * Get product tier price by qty
     *
     * @param   double $qty
     * @param   Mage_Catalog_Model_Product $product
     * @return  double
     */
    public function getTierPrice($qty=null, $product)
    {
        $allGroups = Mage_Customer_Model_Group::CUST_GROUP_ALL;
        $prices = $product->getData('tier_price');

        if (is_null($prices)) {
            if ($attribute = $product->getResource()->getAttribute('tier_price')) {
                $attribute->getBackend()->afterLoad($product);
                $prices = $product->getData('tier_price');
            }
        }

        if (is_null($prices) || !is_array($prices)) {
            if (!is_null($qty)) {
                return $product->getPrice();
            }
            return array(array(
                'price'         => $product->getPrice(),
                'website_price' => $product->getPrice(),
                'price_qty'     => 1,
                'cust_group'    => $allGroups,
            ));
        }

        $custGroup = $this->_getCustomerGroupId($product);
        if ($qty) {
            $prevQty = 1;
            $prevPrice = 0;
            $prevGroup = $allGroups;

            foreach ($prices as $price) {
                if ($price['cust_group']!=$custGroup && $price['cust_group']!=$allGroups) {
                    // tier not for current customer group nor is for all groups
                    continue;
                }
                if ($qty < $price['price_qty']) {
                    // tier is higher than product qty
                    continue;
                }
                if ($price['price_qty'] < $prevQty) {
                    // higher tier qty already found
                    continue;
                }
                if ($price['price_qty'] == $prevQty && $prevGroup != $allGroups && $price['cust_group'] == $allGroups) {
                    // found tier qty is same as current tier qty but current tier group is ALL_GROUPS
                    continue;
                }
                $prevPrice  = $price['website_price'];
                $prevQty    = $price['price_qty'];
                $prevGroup  = $price['cust_group'];
            }
            return $prevPrice;
        } else {
            foreach ($prices as $i=>$price) {
                if ($price['cust_group']!=$custGroup && $price['cust_group']!=$allGroups) {
                    unset($prices[$i]);
                }
            }
        }

        return ($prices) ? $prices : array();
    }

    /**
     * Apply special price for bundle
     *
     * @param   Mage_Catalog_Model_Product $product
     * @param   double $finalPrice
     * @return  double
     */
    protected function _applySpecialPrice($product, $finalPrice)
    {
        $specialPrice = $product->getSpecialPrice();
        if (is_numeric($specialPrice)) {
            $today = floor(time()/86400)*86400;
            $from = floor(strtotime($product->getSpecialFromDate())/86400)*86400;
            $to = floor(strtotime($product->getSpecialToDate())/86400)*86400;

            if ($product->getSpecialFromDate() && $today < $from) {
            } elseif ($product->getSpecialToDate() && $today > $to) {
            } else {
                $specialPrice = ($finalPrice*$specialPrice)/100;
                $finalPrice = min($finalPrice, $specialPrice);
            }
        }
        return $finalPrice;
    }
}