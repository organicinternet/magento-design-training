<?php
class Mage_Weee_Model_Mysql4_Tax extends Mage_Core_Model_Mysql4_Abstract {
    protected function _construct()
    {
        $this->_init('weee/tax', 'value_id');
    }
    
    public function fetchOne($select)
    {
        return $this->_getReadAdapter()->fetchOne($select);
    }

    public function fetchCol($select)
    {
        return $this->_getReadAdapter()->fetchCol($select);
    }

    public function getProductAppliedPriceRules($product)
    {
        $now = strtotime(now());
        $table = $this->getTable('catalogrule/rule_product');
        $select = $this->_getReadAdapter()->select();
        $select->from($table)
            ->where('product_id = ?', $product->getId())
            ->where('website_id = ?', Mage::app()->getStore()->getWebsiteId())
            ->where('customer_group_id = ?', Mage::getSingleton('customer/session')->getCustomerGroupId())
            ->where('(from_time <= ? OR from_time = 0)', $now)
            ->where('(to_time >= ? OR to_time = 0)', $now);

        $select->order('sort_order');
        $result = $this->_getReadAdapter()->fetchAll($select);

        if ($result) {
            return $result;
        } else {
            return array();
        }
    }

    public function updateDiscountPercents()
    {
//        $all = $this->_getReadAdapter()->select()->from($this->getTable('catalogrule/affected_product'), 'product_id');
//        $this->_getWriteAdapter()->delete($this->getTable('weee/discount'), array($this->_getWriteAdapter()->quoteInto('entity_id IN (?)', $all)));
        $this->_getWriteAdapter()->delete($this->getTable('weee/discount'));
        $now = strtotime(now());

        $select = $this->_getReadAdapter()->select();
        $select->from(array('data'=>$this->getTable('catalogrule/rule_product')))
//            ->join(array('filter'=>$this->getTable('catalogrule/affected_product')), 'data.product_id = filter.product_id', array())
            ->where('(from_time <= ? OR from_time = 0)', $now)
            ->where('(to_time >= ? OR to_time = 0)', $now)
            ->order(array('data.website_id', 'data.customer_group_id', 'data.product_id', 'data.sort_order'));

        $data = $this->_getReadAdapter()->fetchAll($select);
        $productData = array();
        $stops = array();
        foreach ($data as $row) {
            $key = "{$row['product_id']}-{$row['website_id']}-{$row['customer_group_id']}";
            if (isset($stops[$key]) && $stops[$key]) {
                continue;
            }

            if ($row['action_operator'] == 'by_percent') {
                if (isset($productData[$key])) {
                    $productData[$key]['value'] += $productData[$key]['value']/100*$row['action_amount'];
                } else {
                    $productData[$key] = array(
                        'entity_id'         => $row['product_id'],
                        'customer_group_id' => $row['customer_group_id'],
                        'website_id'        => $row['website_id'],
                        'value'             => 100-max(0, min(100, $row['action_amount'])),
                    );
                }                
            }

            if ($row['action_stop']) {
                $stops[$key] = true;
            }
        }

        foreach ($productData as $product) {
            $this->_getWriteAdapter()->insert($this->getTable('weee/discount'), $product);
        }
    }
}