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
 * Product options abstract type block
 *
 * @category   Mage
 * @package    Mage_Catalog
 * @author     Magento Core Team <core@magentocommerce.com>
 */
abstract class Mage_Catalog_Block_Product_View_Options_Abstract extends Mage_Core_Block_Template
{
    protected $_option;

    /**
     * Enter description here...
     *
     * @param Mage_Catalog_Model_Product_Option $option
     * @return unknown
     */
    public function setOption(Mage_Catalog_Model_Product_Option $option)
    {
        $this->_option = $option;
        return $this;
    }

    /**
     * Enter description here...
     *
     * @return Mage_Catalog_Model_Product_Option
     */
    public function getOption()
    {
        return $this->_option;
    }
}