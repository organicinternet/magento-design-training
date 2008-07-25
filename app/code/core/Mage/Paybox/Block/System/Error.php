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
 * @package    Mage_Paybox
 * @copyright  Copyright (c) 2008 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */


/**
 * Paybox System Error Block
 *
 * @category   Mage
 * @package    Mage_Paybox
 * @author     Magento Core Team <core@magentocommerce.com>
 */
class Mage_Paybox_Block_System_Error extends Mage_Core_Block_Template
{
    protected $_pbxErrorsDesc = array(
        '-1' => Mage::helper('paybox')->__('Error in reading the parameters via stdin (POST method) (error in http reception)'),
        '-2' => Mage::helper('paybox')->__('Error in memory allocation. Not enough memory available on the trader\'s server'),
        '-3' => Mage::helper('paybox')->__('Error in reading the parameters QUERY_STRING or CONTENT_LENGTH. (http error)'),
        '-4' => Mage::helper('paybox')->__('PBX_RETOUR, PBX_ANNULE, PBX_REFUSE or PBX_EFFECTUE are too long (<150 characters)'),
        '-5' => Mage::helper('paybox')->__('Error in opening the file (if PBX_MODE contains 3) : local file non-existent, not found or access error'),
        '-6' => Mage::helper('paybox')->__('Error in file format (if PBX_MODE contains 3) : local file badly formed, empty or lines are badly formatted'),
        '-7' => Mage::helper('paybox')->__('A compulsory variable is missing (PBX_SITE, PBX_RANG, PBX_IDENTIFIANT, PBX_TOTAL, PBX_CMD, etc.)'),
        '-8' => Mage::helper('paybox')->__('One of the numerical variables contains a non-numerical character (site, rank, identifier, amount, currency etc.)'),
        '-9' => Mage::helper('paybox')->__('PBX_SITE contains a site number which does not consist of exactly 7 characters'),
        '-10' => Mage::helper('paybox')->__('PBX_RANG contains a rank number which does not consist of exactly 2 characters'),
        '-11' => Mage::helper('paybox')->__('PBX_TOTAL has more than 10 or fewer than 3 numerical characters'),
        '-12' => Mage::helper('paybox')->__('PBX_LANGUE or PBX_DEVISE contains a code which does not contain exactly 3 characters'),
        '-13' => Mage::helper('paybox')->__('PBX_CMD is empty or contains a reference longer than 250 characters'),
        '-14' => '',
        '-15' => '',
        '-16' => Mage::helper('paybox')->__('PBX_PORTEUR does not contain a valid e-mail address'),
        '-17' => Mage::helper('paybox')->__('Error of coherence (multi-baskets) : Reserved Future Usage'),
    );

    /**
     * Enter description here...
     *
     * @return Mage_Checkout_Model_Session
     */
    public function getCheckout()
    {
        return Mage::getSingleton('checkout/session');
    }

    public function getErrorMessage()
    {
        $msg = $this->_pbxErrorsDesc[$this->getCheckout()->getPayboxErrorNumber()];
        $this->getCheckout()->unsPayboxErrorNumber();
        return $msg;
    }

    /**
     * Get continue shopping url
     */
    public function getContinueShoppingUrl()
    {
        return Mage::getUrl('checkout/cart', array('_secure' => true));
    }
}