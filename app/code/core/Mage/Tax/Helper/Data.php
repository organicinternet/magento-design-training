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
 * @package    Mage_Tax
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * Catalog data helper
 */
class Mage_Tax_Helper_Data extends Mage_Core_Helper_Abstract
{
    const PRICE_CONVERSION_PLUS = 1;
    const PRICE_CONVERSION_MINUS = 2;


    protected $_displayTaxColumn;
    protected $_taxData;
    protected $_priceIncludesTax;
    protected $_applyTaxAfterDiscount;
    protected $_priceDisplayType;

    public function getProductPrice($product, $format=null)
    {
        try {
            $value = $product->getPrice();
            $value = Mage::app()->getStore()->convertPrice($value, $format);
        }
        catch (Exception $e){
            $value = $e->getMessage();
        }
    	return $value;
    }

    public function priceIncludesTax($store=null)
    {
        $storeId = Mage::app()->getStore($store)->getId();
        if (!isset($this->_priceIncludesTax[$storeId])) {
            $this->_priceIncludesTax[$storeId] =
                (int)Mage::getStoreConfig(Mage_Tax_Model_Config::CONFIG_XML_PATH_PRICE_INCLUDES_TAX, $store);
        }
        return $this->_priceIncludesTax[$storeId];
    }

    public function applyTaxAfterDiscount($store=null)
    {
        $storeId = Mage::app()->getStore($store)->getId();
        if (!isset($this->_applyTaxAfterDiscount[$storeId])) {
            $this->_applyTaxAfterDiscount[$storeId] =
                (int)Mage::getStoreConfig(Mage_Tax_Model_Config::CONFIG_XML_PATH_APPLY_AFTER_DISCOUNT, $store);
        }
        return $this->_applyTaxAfterDiscount[$storeId];
    }

    /**
     * Output
     *
     * @param boolean $includes
     */
    public function getIncExcText($flag, $store=null)
    {
        if ($flag) {
            $s = $this->__('Incl. Tax');
        } else {
            $s = $this->__('Excl. Tax');
        }
        return $s;
    }

/*
    public function updateProductTax($product)
    {
        $store = Mage::app()->getStore($product->getStoreId());
        $taxRatio = $this->getCatalogTaxRate($product->getTaxClassId(), null, $store);
        if (false===$taxRatio) {
            return false;
        }
        $taxRatio /= 100;
        $product->setPriceAfterTax($store->roundPrice($product->getPrice()*(1+$taxRatio)));
        $product->setFinalPriceAfterTax($store->roundPrice($product->getFinalPrice()*(1+$taxRatio)));
        $product->setShowTaxInCatalog(Mage::getStoreConfig(Mage_Tax_Model_Config::CONFIG_XML_PATH_SHOW_IN_CATALOG, $store));

        return $taxRatio;
    }
*/
    public function getPriceDisplayType($store = null)
    {

        $storeId = Mage::app()->getStore($store)->getId();
        if (!isset($this->_priceDisplayType[$storeId])) {
            $this->_priceDisplayType[$storeId] =
                (int)Mage::getStoreConfig(Mage_Tax_Model_Config::CONFIG_XML_PATH_PRICE_DISPLAY_TYPE, $store);
        }
        return $this->_priceDisplayType[$storeId];
    }

    public function needPriceConversion($store = null)
    {
        if ($this->priceIncludesTax($store)) {
            switch ($this->getPriceDisplayType($store)) {
                case Mage_Tax_Model_Config::DISPLAY_TYPE_EXCLUDING_TAX:
                case Mage_Tax_Model_Config::DISPLAY_TYPE_BOTH:
                    return self::PRICE_CONVERSION_MINUS;

                case Mage_Tax_Model_Config::DISPLAY_TYPE_INCLUDING_TAX:
                    return false;
            }
        } else {
            switch ($this->getPriceDisplayType($store)) {
                case Mage_Tax_Model_Config::DISPLAY_TYPE_INCLUDING_TAX:
                    return self::PRICE_CONVERSION_PLUS;

                case Mage_Tax_Model_Config::DISPLAY_TYPE_BOTH:
                case Mage_Tax_Model_Config::DISPLAY_TYPE_EXCLUDING_TAX:
                    return false;
            }
        }
        return false;
    }

    public function displayFullSummary($store = null)
    {
        return ((int)Mage::getStoreConfig(Mage_Tax_Model_Config::CONFIG_XML_PATH_DISPLAY_FULL_SUMMARY, $store) == 1);
    }

    public function displayCartPriceInclTax($store = null)
    {
        return $this->displayTaxColumn($store) == Mage_Tax_Model_Config::DISPLAY_TYPE_INCLUDING_TAX;
    }

    public function displayCartPriceExclTax($store = null)
    {
        return $this->displayTaxColumn($store) == Mage_Tax_Model_Config::DISPLAY_TYPE_EXCLUDING_TAX;
    }

    public function displayCartBothPrices($store = null)
    {
        return $this->displayTaxColumn($store) == Mage_Tax_Model_Config::DISPLAY_TYPE_BOTH;
    }

    public function displayTaxColumn($store = null)
    {
        if (is_null($this->_displayTaxColumn)) {
            $this->_displayTaxColumn = (int)Mage::getStoreConfig(Mage_Tax_Model_Config::CONFIG_XML_PATH_DISPLAY_TAX_COLUMN, $store);
        }
        return $this->_displayTaxColumn;
    }

    public function getPriceFormat($store = null)
    {
        return Zend_Json::encode(Mage::app()->getLocale()->getJsPriceFormat());
    }

    public function getTaxRatesByProductClass()
    {
        $result = array();
        $calc = Mage::getModel('tax/calculation');
        $rates = $calc->getRatesForAllProductTaxClasses($calc->getRateRequest());

        foreach ($rates as $class=>$rate) {
            $result["value_{$class}"] = $rate;
        }

        return Zend_Json::encode($result);
    }

    public function getPrice($product, $price, $includingTax = null)
    {
        $store = Mage::app()->getStore();
        $percent = $product->getTaxPercent();

        if (is_null($percent)) {
            $taxClassId = $product->getTaxClassId();
            if ($taxClassId) {
                $request = Mage::getModel('tax/calculation')->getRateRequest();
                $percent = Mage::getModel('tax/calculation')->getRate($request->setProductClassId($taxClassId));
            }
        }

        if (!$percent) {
            return $price;
        }

        $product->setTaxPercent($percent);

        if (is_null($includingTax)) {
            switch ($this->needPriceConversion()) {
                case self::PRICE_CONVERSION_MINUS:
                    return $this->_calculatePrice($price, $percent, false);
                case self::PRICE_CONVERSION_PLUS:
                    return $this->_calculatePrice($price, $percent, true);
                default:
                    return $price;
            }
        }

        if ($this->priceIncludesTax() && !$includingTax) {
            return $this->_calculatePrice($price, $percent, false);
        } else if (!$this->priceIncludesTax() && $includingTax) {
            return $this->_calculatePrice($price, $percent, true);
        }
        return $price;

    }

    public function displayPriceIncludingTax()
    {
        return $this->getPriceDisplayType() == Mage_Tax_Model_Config::DISPLAY_TYPE_INCLUDING_TAX;
    }

    public function displayPriceExcludingTax()
    {
        return $this->getPriceDisplayType() == Mage_Tax_Model_Config::DISPLAY_TYPE_EXCLUDING_TAX;
    }

    public function displayBothPrices()
    {
        return $this->getPriceDisplayType() == Mage_Tax_Model_Config::DISPLAY_TYPE_BOTH;
    }

    protected function _calculatePrice($price, $percent, $type)
    {
        $store = Mage::app()->getStore();
        if ($type) {
            return $store->roundPrice($price * (1+($percent/100)));
        } else {
            return $store->roundPrice($price - ($price/(100+$percent)*$percent));
        }
    }

    public function getIncExcTaxLabel($flag)
    {
        $text = $this->getIncExcText($flag);
        return $text ? ' <span class="tax-flag">('.$text.')</span>' : '';
    }
}
