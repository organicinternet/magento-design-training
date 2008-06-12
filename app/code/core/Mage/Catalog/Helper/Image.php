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
 * Catalog image helper
 *
 * @author      Magento Core Team <core@magentocommerce.com>
 */
class Mage_Catalog_Helper_Image extends Mage_Core_Helper_Abstract
{
    protected $_model;
    protected $_scheduleResize = false;
    protected $_scheduleWatermark = false;
    protected $_scheduleRotate = false;
    protected $_angle;
    protected $_watermark;
    protected $_watermarkPosition;
    protected $_watermarkSize;
    protected $_product;
    protected $_imageFile;
    protected $_placeholder;

    /**
     * Reset all previos data
     */
    protected function _reset()
    {
        $this->_model = null;
        $this->_scheduleResize = false;
        $this->_scheduleWatermark = false;
        $this->_scheduleRotate = false;
        $this->_angle = null;
        $this->_watermark = null;
        $this->_watermarkPosition = null;
        $this->_watermarkSize = null;
        $this->_product = null;
        $this->_imageFile = null;
        return $this;
    }

    public function init(Mage_Catalog_Model_Product $product, $attributeName, $imageFile=null)
    {
        $this->_reset();
        $this->_setModel( Mage::getModel('catalog/product_image') );
        $this->_getModel()->setDestinationSubdir($attributeName);
        $this->setProduct($product);
        if( $imageFile ) {
            $this->setImageFile( $imageFile );
        }
        return $this;
    }

    public function resize($width = null, $height = null, $keepAspectRatio = true)
    {
        // $this->_getModel()->setSize("{$width}x{$height}");
        $this->_getModel()
            ->setWidth($width)
            ->setHeight($height)
            ->setKeepAspectRatio($keepAspectRatio)
        ;
        $this->_scheduleResize = true;
        return $this;
    }

    /**
     * Enable filling with a color on resize.
     *
     * The image frame will be as on resize() specified,
     * and the picture will be constrained into that frame.
     *
     * By default it is enabled.
     *
     * @see setFillColor() for color to fill
     * @see resize()
     * @param bool $flag
     * @return Mage_Catalog_Helper_Image
     */
    public function preserveFrameSize($flag = true)
    {
        $this->_getModel()->setFillOnResize($flag);
        return $this;
    }

    /**
     * Set color, that will fill whitespace on resize.
     *
     * If $alpha specified, it will try to apply alpha-transparency to the image
     *
     * By default it is white (array(255, 255, 255, null))
     *
     * @see resize()
     * @see preserveFrameSize()
     * @param int $r 0..255
     * @param int $g 0..255
     * @param int $b 0..255
     * @param int $alpha 0..127
     * @return Mage_Catalog_Helper_Image
     */
    public function setFillColor($r, $g, $b, $alpha = null)
    {
        $this->_getModel()->setFillColorOnResize(array($r, $g, $b, $alpha));
        return $this;
    }

    public function rotate($angle)
    {
        $this->setAngle($angle);
        $this->_getModel()->setAngle($angle);
        $this->_scheduleRotate = true;
        return $this;
    }

    public function watermark($fileName, $position, $size=null)
    {
        $this->setWatermark($fileName)
            ->setWatermarkPosition($position)
            ->setWatermarkSize($size);
        $this->_scheduleWatermark = true;
        return $this;
    }

    public function placeholder($fileName)
    {
        $this->_placeholder = $fileName;
    }

    public function getPlaceholder()
    {
        if (!$this->_placeholder) {
            $attr = $this->_getModel()->getDestinationSubdir();
            $this->_placeholder = 'images/catalog/product/placeholder/'.$attr.'.jpg';
        }
        return $this->_placeholder;
    }

    public function __toString()
    {
        try {
            if( $this->getImageFile() ) {
                $this->_getModel()->setBaseFile( $this->getImageFile() );
            } else {
                $this->_getModel()->setBaseFile( $this->getProduct()->getData($this->_getModel()->getDestinationSubdir()) );
            }

            if( $this->_getModel()->isCached() ) {
                return $this->_getModel()->getUrl();
            } else {
                if( $this->_scheduleRotate ) {
                    $this->_getModel()->rotate( $this->getAngle() );
                }

                if( $this->_scheduleResize ) {
                    $this->_getModel()->resize();
                }

                if( $this->_scheduleWatermark ) {
                    $this->_getModel()
                        ->setWatermarkPosition( $this->getWatermarkPosition() )
                        ->setWatermarkSize($this->parseSize($this->getWatermarkSize()))
                        ->setWatermark($this->getWatermark(), $this->getWatermarkPosition());
                } else {
                    if( $watermark = Mage::getStoreConfig("design/watermark/{$this->_getModel()->getDestinationSubdir()}_image") ) {
                        $this->_getModel()
                            ->setWatermarkPosition( $this->getWatermarkPosition() )
                            ->setWatermarkSize($this->parseSize($this->getWatermarkSize()))
                            ->setWatermark($watermark, $this->getWatermarkPosition());
                    }
                }

                $url = $this->_getModel()->saveFile()->getUrl();
            }
        } catch( Exception $e ) {
            $url = '';
        }
        if (!$url) {
            $url = Mage::getDesign()->getSkinUrl($this->getPlaceholder());
        }
        return $url;
    }

    /**
     * Enter description here...
     *
     * @return Mage_Catalog_Helper_Image
     */
    protected function _setModel($model)
    {
        $this->_model = $model;
        return $this;
    }

    /**
     * Enter description here...
     *
     * @return Mage_Catalog_Model_Product_Image
     */
    protected function _getModel()
    {
        return $this->_model;
    }

    protected function setAngle($angle)
    {
        $this->_angle = $angle;
        return $this;
    }

    protected function getAngle()
    {
        return $this->_angle;
    }

    protected function setWatermark($watermark)
    {
        $this->_watermark = $watermark;
        return $this;
    }

    protected function getWatermark()
    {
        return $this->_watermark;
    }

    protected function setWatermarkPosition($position)
    {
        $this->_watermarkPosition = $position;
        return $this;
    }

    protected function getWatermarkPosition()
    {
        if( $this->_watermarkPosition ) {
            return $this->_watermarkPosition;
        } else {
            return Mage::getStoreConfig("design/watermark/{$this->_getModel()->getDestinationSubdir()}_position");
        }
    }

    public function setWatermarkSize($size)
    {
        $this->_watermarkSize = $size;
        return $this;
    }

    protected function getWatermarkSize()
    {
        if( $this->_watermarkSize ) {
            return $this->_watermarkSize;
        } else {
            return Mage::getStoreConfig("design/watermark/{$this->_getModel()->getDestinationSubdir()}_size");
        }
    }

    protected function setProduct($product)
    {
        $this->_product = $product;
        return $this;
    }

    protected function getProduct()
    {
        return $this->_product;
    }

    protected function setImageFile($file)
    {
        $this->_imageFile = $file;
        return $this;
    }

    protected function getImageFile()
    {
        return $this->_imageFile;
    }

    /**
     * Enter description here...
     *
     * @return array
     */
    protected function parseSize($string)
    {
        $size = explode('x', strtolower($string));
        if( sizeof($size) == 2 ) {
            return array(
                'width' => ($size[0] > 0) ? $size[0] : null,
                'heigth' => ($size[1] > 0) ? $size[1] : null,
            );
        }
        return false;
    }
}