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
 * @package     Mage_Checkout
 * @copyright   Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * Shopping cart item render block
 *
 * @category    Mage
 * @package     Mage_Checkout
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Checkout_Block_Cart_Item_Renderer_Configurable extends Mage_Checkout_Block_Cart_Item_Renderer
{
    const CONFIGURABLE_PRODUCT_IMAGE= 'checkout/cart/configurable_product_image';
    const USE_PARENT_IMAGE          = 'parent';

    /**
     * Get item configurable product
     *
     * @return Mage_Catalog_Model_Product
     */
    public function getConfigurableProduct()
    {
        if ($option = $this->getItem()->getOptionByCode('product_type')) {
            return $option->getProduct();
        }
        return $this->getProduct();
    }

    /**
     * Get product thumbnail image
     *
     * @return Mage_Catalog_Model_Product_Image
     */
    public function getProductThumbnail()
    {
        $product = $this->getProduct();
        if (($product->getData('thumbnail') == 'no_selection')
            || (Mage::getStoreConfig(self::CONFIGURABLE_PRODUCT_IMAGE) == self::USE_PARENT_IMAGE)) {
            $product = $this->getConfigurableProduct();
        }
        return $this->helper('catalog/image')->init($product, 'thumbnail');
    }

    /**
     * Get item product name
     *
     * @return string
     */
    public function getProductName()
    {
        return $this->getConfigurableProduct()->getName();
    }

    /**
     * Get url to item product
     *
     * @return string
     */
    public function getProductUrl()
    {
        return $this->getConfigurableProduct()->getProductUrl();
    }

    /**
     * Get selected for configurable product attributes
     *
     * @return array
     */
    public function getProductAttributes()
    {
        $attributes = array();
        Varien_Profiler::start('CART:'.__METHOD__);
        if ($attributesOption = $this->getItem()->getOptionByCode('attributes')) {
            $data = unserialize($attributesOption->getValue());
            $usedAttributes = $this->getConfigurableProduct()->getTypeInstance()->getUsedProductAttributes();

            foreach ($data as $attributeId => $attributeValue) {
            	if (isset($usedAttributes[$attributeId])) {
            	    $attribute = $usedAttributes[$attributeId];
            	    $label = $attribute->getFrontend()->getLabel();

            	    if ($attribute->getSourceModel()) {
            	        $value = $this->htmlEscape($attribute->getSource()->getOptionText($attributeValue));
            	    }
            	    else {
            	        $value = $this->htmlEscape($this->getProduct()->getData($attribute->getCode()));
            	    }

            	    $attributes[] = array('label'=>$label, 'value'=>$value);
            	}
            }
        }
        Varien_Profiler::stop('CART:'.__METHOD__);
        return $attributes;
    }

    /**
     * Retrieve item messages
     * Return array with keys
     *
     * type     => type of a message
     * text     => the message text
     *
     * @return array
     */
    public function getMessages()
    {
        $messages = array();
        if ($options = $this->getItem()->getQtyOptions()) {
            foreach ($options as $option) {
                /* @var $option Mage_Sales_Model_Quote_Item_Option */
                if ($option->getMessage()) {
                    $messages[] = array(
                        'text'  => $option->getMessage(),
                        'type'  => $option->getHasError() ? 'error' : 'notice'
                    );
                }
            }
        }
        return $messages;
    }
}