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
 * @package    Mage_Tax
 * @copyright  Copyright (c) 2008 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * Tax rate resource
 *
 * @category   Mage
 * @package    Mage_Tax
 * @author      Magento Core Team <core@magentocommerce.com>
 */

class Mage_Strikeiron_Model_Mysql4_Taxrate extends Mage_Core_Model_Mysql4_Abstract
{
     protected $_uniqueFields = array(
        array(
            'field' => array('tax_country_id', 'tax_region_id', 'tax_postcode'),
            'title' => 'Country/Region/Postal code combination',
        ),
    );

    protected function _construct()
    {
        $this->_init('strikeiron/tax_rate', 'tax_rate_id');
    }

    protected function _checkUnique(Mage_Core_Model_Abstract $object)
    {
        $existent = array();
        $rateValueArray = array();
        if (!empty($this->_uniqueFields)) {
            if (!is_array($this->_uniqueFields)) {
                $this->_uniqueFields = array(
                    array(
                        'field' => $this->_uniqueFields,
                        'title' => $this->_uniqueFields
                ));
            }

            $data = new Varien_Object($this->_prepareDataForSave($object));
            $select = $this->_getWriteAdapter()->select()
                ->from($this->getMainTable());

            foreach ($this->_uniqueFields as $unique) {
                $select->reset(Zend_Db_Select::WHERE);

                if (is_array($unique['field'])) {
                    foreach ($unique['field'] as $field) {
                        $select->where($field.'=?', $data->getData($field));
                        $rateValueArray[] = $this->_getWriteAdapter()->quoteInto($field.'=?', $data->getData($field));
                    }
                }
                else {
                    $select->where( $unique['field'] . ' = ?', $data->getData($unique['field']) );
                    $rateValueArray[] = $this->_getWriteAdapter()->quoteInto( $unique['field'] . ' = ?', $data->getData($unique['field']) );
                }

                if ($object->getId()) {
                    $select->where($this->getIdFieldName().' != ?', $object->getId());
                }

                if ( $test = $this->_getWriteAdapter()->fetchRow($select) ) {
                    $existent[] = $test['tax_rate_id'];
                }
            }
        }
        if (!empty($existent)) {
            $this->_getWriteAdapter()->delete($this->getMainTable(), $rateValueArray);
        }

    }

    public function deleteAllRates()
    {
    	$this->_getWriteAdapter()->delete($this->getMainTable());
    }
}