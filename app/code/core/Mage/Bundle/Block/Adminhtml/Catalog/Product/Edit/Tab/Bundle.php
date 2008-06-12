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
 * Adminhtml catalog product bundle items tab block
 *
 * @category    Mage
 * @package     Mage_Bundle
 * @author      Magento Core Team <core@magentocommerce.com>
 */

class Mage_Bundle_Block_Adminhtml_Catalog_Product_Edit_Tab_Bundle extends Mage_Adminhtml_Block_Widget
{
    public function __construct()
    {
        parent::__construct();
        $this->setTemplate('bundle/product/edit/bundle.phtml');
    }

    protected function _prepareLayout()
    {
        $this->setChild('add_button',
            $this->getLayout()->createBlock('adminhtml/widget_button')
                ->setData(array(
                    'label' => Mage::helper('bundle')->__('Add New Option'),
                    'class' => 'add',
                    'id'    => 'add_new_option',
                    'on_click' => 'bOption.add()'
                ))
        );

        $this->setChild('options_box',
            $this->getLayout()->createBlock('bundle/adminhtml_catalog_product_edit_tab_bundle_option')
        );

        return parent::_prepareLayout();
    }

    /*
    protected function _prepareForm()
    {
        $product = $this->getProduct();

        $form = new Varien_Data_Form();
        $fieldset = $form->addFieldset('bundled_options', array('legend'=>Mage::helper('bundle')->__('Options')));

        $fieldset->addField('bundle_options', 'text', array(
                'name'=>'bundle_items',
                'class'=>'requried-entry',
                'value'=>$product->getData('bundle_items')
        ));

        $form->getElement('bundle_options')->setRenderer(
            $this->getLayout()->createBlock('bundle/adminhtml_catalog_product_edit_tab_bundle_item')
        );

        $this->setForm($form);

    }
    */

    public function getAddButtonHtml()
    {
        return $this->getChildHtml('add_button');
    }

    public function getOptionsBoxHtml()
    {
        return $this->getChildHtml('options_box');
    }
}
