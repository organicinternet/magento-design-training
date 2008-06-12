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
 * Product options block
 *
 * @category   Mage
 * @package    Mage_Catalog
 * @author     Magento Core Team <core@magentocommerce.com>
 */
class Mage_Catalog_Block_Product_View_Options extends Mage_Core_Block_Template
{
    protected $_product;

    protected $_optionRenders = array();

    public function __construct()
    {
        parent::__construct();
        $this->addOptionRender(
            'default',
            'catalog/product_view_options_type_default',
            'catalog/product/view/options/type/default.phtml'
        );
    }

    /**
     * Enter description here...
     *
     * @return Mage_Catalog_Model_Product
     */
    public function getProduct()
    {
        if (!$this->_product) {
            if (Mage::registry('product')) {
                $this->_product = Mage::registry('product');
            } else {
                $this->_product = Mage::getSingleton('catalog/product');
            }
        }
        return $this->_product;
    }

    public function setProduct($product)
    {
        $this->_product = $product;
        return $this;
    }

    public function addOptionRender($type, $block, $template)
    {
        $this->_optionRenders[$type] = array(
            'block' => $block,
            'template' => $template,
        );
        return $this;
    }

    /**
     * Enter description here...
     *
     * @param string $type
     */
    public function getOptionRender($type)
    {
        if (isset($this->_optionRenders[$type])) {
            return $this->_optionRenders[$type];
        }

        return $this->_optionRenders['default'];
    }

    public function getGroupOfOption($type)
    {
        $group = Mage::getSingleton('catalog/product_option')->getGroupByType($type);

        return $group == '' ? 'default' : $group;
    }

    /**
     * Enter description here...
     *
     * @return Mage_Catalog_Model_Resource_Eav_Mysql4_Product_Option_Collection
     */
    public function getOptions()
    {
        $collection = $this->getProduct()
            ->getProductOptionsCollection()
            ->setOrder('sort_order', 'asc')
            ->load(false);
        return $collection;
    }

    /**
     * Enter description here...
     *
     * @param Mage_Catalog_Model_Product_Option $option
     */
    public function getOptionHtml(Mage_Catalog_Model_Product_Option $option)
    {
        $render = $this->getOptionRender(
            $this->getGroupOfOption($option->getType())
        );
        return $this->getLayout()->createBlock($render['block'])
            ->setOption($option)
            ->setTemplate($render['template'])->toHtml();

    }
}