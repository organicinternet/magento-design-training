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
 * @package    Mage_Oscommerce
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * osCommerce orders controller
 * 
 * @author      Magento Core Team <core@magentocommerce.com>
 */

class Mage_Oscommerce_Adminhtml_OrderController extends Mage_Adminhtml_Controller_Action
{

    /**
     * Initailization of action
     */
    protected function _initAction()
    {
        $this->loadLayout();
        $this->_setActiveMenu('oscommerce/adminhtml_order');
        return $this;
    }
    

    /**
     * Initialization of order
     *
     * @param idFieldnName string
     * @return Mage_Adminhtml_System_Convert_OscController
     */
    protected function _initOrder()
    {
        $id = $this->getRequest()->getParam('order_id');
        $order = Mage::getModel('oscommerce/oscommerce_order')->load($id);

        if (!$order->getId()) {
            $this->_getSession()->addError($this->__('This order no longer exists.'));
            $this->_redirect('*/*/');
            $this->setFlag('', self::FLAG_NO_DISPATCH, true);
            return false;
        }
        
        Mage::register('current_oscommerce_order', $order);
        return $order;
    }
        
    /**
     * Index osc action
     */
    public function indexAction()
    {
        $this->_initAction();
        $this->_addContent(
            $this->getLayout()->createBlock('oscommerce/adminhtml_order')
        );
        $this->renderLayout();
    }

    /**
     * osCommerce Order view page
     */
    public function viewAction()
    {
        if ($order = $this->_initOrder()) {
            $this->_initAction()
                ->_addBreadcrumb($this->__('View Order'), $this->__('View Order'))
                ->_addContent($this->getLayout()->createBlock('oscommerce/adminhtml_order_view'))
                ->renderLayout();
        }        
    }        
}