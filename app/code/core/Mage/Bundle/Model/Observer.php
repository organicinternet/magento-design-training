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
 * Bundle Products Observer
 *
 * @category    Mage
 * @package     Mage_Bundle
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Bundle_Model_Observer
{
    /**
     * Setting Bundle Items Data to product for father processing
     *
     * @param Varien_Object $observer
     * @return Mage_Bundle_Model_Observer
     */
    public function prepareProductSave($observer)
    {
        $request = $observer->getEvent()->getRequest();
        $product = $observer->getEvent()->getProduct();

        if ($items = $request->getPost('bundle_options')) {
            $product->setBundleOptionsData($items);
        }

        if ($selections = $request->getPost('bundle_selections')) {
            $product->setBundleSelectionsData($selections);
        }

        return $this;
    }
}
