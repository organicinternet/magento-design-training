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
 * @category    Mage
 * @package     Mage_Sales
 * @copyright   Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * Order order item collection
 *
 * @category    Mage
 * @package     Mage_Sales
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Sales_Model_Mysql4_Order_Item_Collection extends Mage_Core_Model_Mysql4_Collection_Abstract
{
    public function _construct()
    {
        $this->_init('sales/order_item');
    }

    /**
     * Set filter by order id
     *
     * @param   mixed $order
     * @return  Mage_Sales_Model_Mysql4_Order_Item_Collection
     */
    public function setOrderFilter($order)
    {
        if ($order instanceof Mage_Sales_Model_Order) {
            $orderId = $order->getId();
        }
        else {
            $orderId = $order;
        }
        $this->addFieldToFilter('order_id', $orderId);
        return $this;
    }

    public function setRandomOrder()
    {
        $this->setOrder('RAND()');
        return $this;
    }
}