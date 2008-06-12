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
 * @category   Varien
 * @package    Varien_Image
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */

/**
 * @file        Abstract.php
 * @author      Magento Core Team <core@magentocommerce.com>
 */

abstract class Varien_Image_Adapter_Abstract
{
    public $fileName = null;
    public $imageBackgroundColor = 0;

    const POSITION_TOP_LEFT = 'top-left';
    const POSITION_TOP_RIGHT = 'top-right';
    const POSITION_BOTTOM_LEFT = 'bottom-left';
    const POSITION_BOTTOM_RIGHT = 'bottom-right';
    const POSITION_STRETCH = 'stretch';
    const POSITION_TILE = 'tile';

    protected $_fileType = null;
    protected $_fileMimeType = null;
    protected $_fileSrcName = null;
    protected $_fileSrcPath = null;
    protected $_imageHandler = null;
    protected $_imageSrcWidth = null;
    protected $_imageSrcHeight = null;
    protected $_requiredExtensions = null;
    protected $_watermarkPosition = null;
    protected $_watermarkWidth = null;
    protected $_watermarkHeigth = null;
    protected $_keepProportion    = true;
    protected $_fillOnResize      = true;
    protected $_fillColorOnResize = array(255, 255, 255, null);

    abstract public function open($fileName);

    abstract public function save($destination=null, $newName=null);

    abstract public function display();

    abstract public function resize($width=null, $height=null);

    abstract public function rotate($angle);

    abstract public function crop($top=0, $left=0, $right=0, $bottom=0);

    abstract public function watermark($watermarkImage, $positionX=0, $positionY=0, $watermarkImageOpacity=30, $repeat=false);

    abstract public function checkDependencies();

    public function getMimeType()
    {
        if( $this->_fileType ) {
            return $this->_fileType;
        } else {
            list($this->_imageSrcWidth, $this->_imageSrcHeight, $this->_fileType, ) = getimagesize($this->_fileName);
            $this->_fileMimeType = image_type_to_mime_type($this->_fileType);
            return $this->_fileMimeType;
        }
    }

    public function setWatermarkPosition($position)
    {
        $this->_watermarkPosition = $position;
        return $this;
    }

    public function getWatermarkPosition()
    {
        return $this->_watermarkPosition;
    }

    public function setWatermarkWidth($width)
    {
        $this->_watermarkWidth = $width;
        return $this;
    }

    public function getWatermarkWidth()
    {
        return $this->_watermarkWidth;
    }

    public function setWatermarkHeigth($heigth)
    {
        $this->_watermarkHeigth = $heigth;
        return $this;
    }

    public function getWatermarkHeigth()
    {
        return $this->_watermarkHeigth;
    }

    public function setKeepProportion($flag)
    {
        $this->_keepProportion = $flag;
        return $this;
    }

    public function keepProportion()
    {
        return $this->_keepProportion;
    }

    public function setFillOnResize($flag)
    {
        $this->_fillOnResize = $flag;
    }

    public function getFillOnResize()
    {
        return $this->_fillOnResize;
    }

    public function setFillColorOnResize($RGBAlphaArray)
    {
        if (count($RGBAlphaArray) !== 4) {
            throw new Exception('Four params must be specified: RGB colors and alpha transparency.');
        }
        list($red, $green, $blue, $alpha) = $RGBAlphaArray;
        foreach (array('red' => 255, 'green' => 255, 'blue' => 255, 'alpha' => 127) as $var => $maxValue) {
            if (((int)$$var < 0) || ((int)$$var > $maxValue)) {
                throw new Exception(sprintf('The "%s" value must be between 0 and %d', $var, $maxValue));
            }
        }
        $this->_fillColorOnResize = array($red, $green, $blue, $alpha);
    }

    protected function _getFileAttributes()
    {
        $pathinfo = pathinfo($this->_fileName);

        $this->_fileSrcPath = $pathinfo['dirname'];
        $this->_fileSrcName = $pathinfo['basename'];
    }
}