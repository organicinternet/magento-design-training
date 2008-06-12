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
 * Product options text type block
 *
 * @category   Mage
 * @package    Mage_Catalog
 * @author     Magento Core Team <core@magentocommerce.com>
 */
class Mage_Catalog_Block_Product_View_Options_Type_Select
    extends Mage_Catalog_Block_Product_View_Options_Abstract
{
    /**
     * Enter description here...
     *
     * @return Mage_Catalog_Model_Product_Option_Value
     */
    public function getValuesCollection()
    {
        $collection = $this->getOption()->getValuesCollection()
            ->setOrder('option_type_id', 'asc')
            ->load(false);

        return $collection;
    }

    public function getValuesHtml()
    {
        $collection = $this->getValuesCollection();

        $_option = $this->getOption();

        if ($_option->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_DROP_DOWN
            || $_option->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_MULTIPLE
            ) {

            $require = ($_option->getIsRequire()) ? ' required-entry' : '';
            $select = $this->getLayout()->createBlock('core/html_select')
                ->setData(array(
                    'id' => 'drop_down',
                    'class' => 'select'.$require
                ))
                ->setName('options['.$_option->getid().']');
            $select->addOption('', $this->__('-- Please Select --'));
            foreach ($collection as $_value) {
                if ($_value->getPriceType() == 'fixed') {
                    $price = $this->helper('core')->currency($_value->getPrice());
                } else {
                    $price = '%' . number_format($_value->getPrice(), 0, null, '');
                }
                $select->addOption($_value->getOptionTypeId(), $_value->getTitle() . ' (' . $price . ')');
            }

            if ($_option->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_MULTIPLE) {
                $select->setExtraParams('multiple="multiple"');
            }

            return $select->getHtml();
        }

        if ($_option->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_RADIO
            || $_option->getType() == Mage_Catalog_Model_Product_Option::OPTION_TYPE_CHECKBOX
            ) {

            $require = ($_option->getIsRequire()) ? ' validate-one-required' : '';
            switch ($_option->getType()) {
                case Mage_Catalog_Model_Product_Option::OPTION_TYPE_RADIO:
                    $type = 'radio';
                    $class = 'form-radio';
                    break;
                case Mage_Catalog_Model_Product_Option::OPTION_TYPE_CHECKBOX:
                    $type = 'checkbox';
                    $class = 'form-radio';
                    break;
            }
            $selectHtml = '';
				$count = 1;
            foreach ($collection as $_value) {
				$count++;
                $selectHtml .= '<input type="'.$type.'" class="'.$require.' '.$class.'" id="options_'.$_option->getId().'_'.$count.'" name="options['.$_option->getId().']" value="'.$_value->getOptionTypeId().'" /><label for="options_'.$_option->getId().'_'.$count.'">'.$_value->getTitle().'</label><br />';
            }

            return $selectHtml;
        }
    }

}