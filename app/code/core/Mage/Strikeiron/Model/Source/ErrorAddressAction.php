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
 * @package    Mage_Strikeiron
 * @copyright  Copyright (c) 2008 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 *
 *
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Strikeiron_Model_Source_ErrorAddressAction
{
    public function toOptionArray()
    {
        return array(
            array('value' => Mage_Strikeiron_Model_Service_AddressVerification::ADDRESS_ERROR_ACCEPT, 'label' => Mage::helper('strikeiron')->__('Accept')),
            array('value' => Mage_Strikeiron_Model_Service_AddressVerification::ADDRESS_ERROR_REJECT, 'label' => Mage::helper('strikeiron')->__('Reject')),
            array('value' => Mage_Strikeiron_Model_Service_AddressVerification::ADDRESS_ERROR_CONFIRM, 'label' => Mage::helper('strikeiron')->__('Pop up warning and accept')),
        );
    }
}