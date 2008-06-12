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
 * @package    Mage_Adminhtml
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * Adminhtml order items grid
 *
 * @category   Mage
 * @package    Mage_Adminhtml
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Adminhtml_Block_Sales_Order_View_Items extends Mage_Adminhtml_Block_Sales_Items_Abstract
{
    /**
     * Retrieve required options from parent
     */
    protected function _beforeToHtml()
    {
        if (!$this->getParentBlock()) {
            Mage::throwException(Mage::helper('adminhtml')->__('Invalid parrent block for this block'));
        }
        $this->setOrder($this->getParentBlock()->getOrder());
        parent::_beforeToHtml();
    }
    
    /**
     * Retrieve order items collection
     *
     * @return unknown
     */
    public function getItemsCollection()
    {
        return $this->getOrder()->getItemsCollection();
    }

    /**
     * Retrieve include tax html formated content
     *
     * @param Varien_Object $item
     * @return string
     */
    public function displayPriceInclTax(Varien_Object $item)
    {
        return $this->getOrder()->formatPrice($item->getPrice()+$item->getTaxAmount()/$item->getQtyOrdered());
    }

    /**
     * Retrieve subtotal price include tax html formated content
     *
     * @param Varien_Object $item
     * @return string
     */
    public function displaySubtotalInclTax($item)
    {
        return $this->getOrder()->formatPrice($item->getRowTotal()+$item->getTaxAmount());
    }

    /**
     * Retrieve tax calculation html content
     *
     * @param Varien_Object $item
     * @return string
     */
    public function displayTaxCalculation(Varien_Object $item)
    {
        if ($item->getTaxPercent() && $item->getTaxString() == '') {
            $percents = array($item->getTaxPercent());
        } else if ($item->getTaxString()) {
            $percents = explode(Mage_Tax_Model_Config::CALCULATION_STRING_SEPARATOR, $item->getTaxString());
        } else {
            return '0%';
        }

        foreach ($percents as &$percent) {
            $percent = sprintf('%.2f%%', $percent);
        }
        return implode(' + ', $percents);
    }

    /**
     * Retrieve tax with persent html content
     *
     * @param Varien_Object $item
     * @return string
     */
    public function displayTaxPercent(Varien_Object $item)
    {
        if ($item->getTaxPercent()) {
            return sprintf('%.2f%%', $item->getTaxPercent());
        } else {
            return '0%';
        }
    }
}