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
 * Bundle selection product grid
 *
 * @category    Mage
 * @package     Mage_Bundle
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Bundle_Block_Adminhtml_Catalog_Product_Edit_Tab_Bundle_Option_Search_Grid extends Mage_Adminhtml_Block_Widget_Grid
{

    public function __construct()
    {
        parent::__construct();
        $this->setId('bundle_selection_search_grid');
        $this->setRowClickCallback('bSelection.productGridRowClick.bind(bSelection)');
        $this->setCheckboxCheckCallback('bSelection.productGridCheckboxCheck.bind(bSelection)');
        $this->setRowInitCallback('bSelection.productGridRowInit.bind(bSelection)');
        $this->setDefaultSort('id');
        $this->setUseAjax(true);
    }

    protected function _beforeToHtml()
    {
        $this->setId($this->getId().'_'.$this->getIndex());
        return parent::_beforeToHtml();
    }

    protected function _prepareCollection()
    {
        $collection = Mage::getModel('catalog/product')->getCollection()
            ->setStore($this->getStore())
            ->addAttributeToSelect('name')
            ->addAttributeToSelect('sku')
            ->addAttributeToSelect('price')
            ->addAttributeToFilter('type_id', array('in' => $this->getAllowedSelectionTypes()))
            ->addStoreFilter();

        if ($products = $this->_getProducts()) {
            $collection->addIdFilter($this->_getProducts(), true);
        }

        Mage::getSingleton('catalog/product_status')->addSaleableFilterToCollection($collection);

        $this->setCollection($collection);

        return parent::_prepareCollection();
    }

    protected function _prepareColumns()
    {
        $this->addColumn('id', array(
            'header'    => Mage::helper('sales')->__('ID'),
            'sortable'  => true,
            'width'     => '60px',
            'index'     => 'entity_id'
        ));
        $this->addColumn('name', array(
            'header'    => Mage::helper('sales')->__('Product Name'),
            'index'     => 'name',
            'column_css_class'=> 'name'
        ));
        $this->addColumn('sku', array(
            'header'    => Mage::helper('sales')->__('SKU'),
            'width'     => '80px',
            'index'     => 'sku'
        ));
        $this->addColumn('price', array(
            'header'    => Mage::helper('sales')->__('Price'),
            'align'     => 'center',
            'type'      => 'currency',
            'currency_code' => $this->getStore()->getCurrentCurrencyCode(),
            'rate'      => $this->getStore()->getBaseCurrency()->getRate($this->getStore()->getCurrentCurrencyCode()),
            'index'     => 'price'
        ));

        $this->addColumn('is_selected', array(
            'header_css_class' => 'a-center',
            'type'      => 'checkbox',
            'name'      => 'in_selected',
            'align'     => 'center',
            'values'    => $this->_getSelectedProducts(),
            'index'     => 'entity_id',
        ));

        $this->addColumn('qty', array(
            'filter'    => false,
            'sortable'  => false,
            'header'    => Mage::helper('sales')->__('Qty To Add'),
            'name'      => 'qty',
            'inline_css'=> 'qty',
            'align'     => 'right',
            'type'      => 'input',
            'validate_class' => 'validate-number',
            'index'     => 'qty',
            'width'     => '130px',
        ));

        return parent::_prepareColumns();
    }

    public function getGridUrl()
    {
        return $this->getUrl('bundle/selection/grid', array('index' => $this->getIndex()));
    }

    protected function _getSelectedProducts()
    {
        $products = $this->getRequest()->getPost('selected_products', array());
        return $products;
    }

    protected function _getProducts()
    {
        $products = $this->getRequest()->getPost('products', null);
        return $products;
    }

    public function getStore()
    {
        return Mage::app()->getStore();
    }

    public function getAllowedSelectionTypes()
    {
        $config = Mage::getConfig()->getNode('global/catalog/product/type/bundle')->asArray();
        return array_keys($config['allowed_selection_types']);
    }


}

