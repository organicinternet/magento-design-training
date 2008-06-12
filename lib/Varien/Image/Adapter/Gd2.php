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


class Varien_Image_Adapter_Gd2 extends Varien_Image_Adapter_Abstract
{
    protected $_requiredExtensions = Array("gd");

    public function open($filename)
    {
        $this->_fileName = $filename;
        $this->getMimeType();
        $this->_getFileAttributes();
        switch( $this->_fileType ) {
            case IMAGETYPE_GIF:
                $this->_imageHandler = imagecreatefromgif($this->_fileName);
                break;

            case IMAGETYPE_JPEG:
                $this->_imageHandler = imagecreatefromjpeg($this->_fileName);
                break;

            case IMAGETYPE_PNG:
                $this->_imageHandler = imagecreatefrompng($this->_fileName);
                break;

            case IMAGETYPE_XBM:
                $this->_imageHandler = imagecreatefromxbm($this->_fileName);
                break;

            case IMAGETYPE_WBMP:
                $this->_imageHandler = imagecreatefromxbm($this->_fileName);
                break;

            default:
                throw new Exception("Unsupported image format.");
                break;
        }
    }

    public function save($destination=null, $newName=null)
    {
        $fileName = ( !isset($destination) ) ? $this->_fileName : $destination;

        if( isset($destination) && isset($newName) ) {
            $fileName = $destination . "/" . $fileName;
        } elseif( isset($destination) && !isset($newName) ) {
            $info = pathinfo($destination);
            $fileName = $destination;
            $destination = $info['dirname'];
        } elseif( !isset($destination) && isset($newName) ) {
            $fileName = $this->_fileSrcPath . "/" . $newName;
        } else {
            $fileName = $this->_fileSrcPath . $this->_fileSrcName;
        }

        $destinationDir = ( isset($destination) ) ? $destination : $this->_fileSrcPath;

        if( !is_writable($destinationDir) ) {
            try {
                $io = new Varien_Io_File();
                $io->mkdir($destination);
            } catch (Exception $e) {
                throw new Exception("Unable to write file into directory '{$destinationDir}'. Access forbidden.");
            }
        }

        switch( $this->_fileType ) {
            case IMAGETYPE_GIF:
                imagegif($this->_imageHandler, $fileName);
                break;

            case IMAGETYPE_JPEG:
                imagejpeg($this->_imageHandler, $fileName);
                break;

            case IMAGETYPE_PNG:
                $this->_saveAlpha($this->_imageHandler);
                imagepng($this->_imageHandler, $fileName);
                break;

            case IMAGETYPE_XBM:
                imagexbm($this->_imageHandler, $fileName);
                break;

            case IMAGETYPE_WBMP:
                imagewbmp($this->_imageHandler, $fileName);
                break;

            default:
                throw new Exception("Unsupported image format.");
                break;
        }

    }

    public function display()
    {
        header("Content-type: ".$this->getMimeType());
        switch( $this->_fileType ) {
            case IMAGETYPE_GIF:
                imagegif($this->_imageHandler);
                break;

            case IMAGETYPE_JPEG:
                imagejpeg($this->_imageHandler);
                break;

            case IMAGETYPE_PNG:
                imagepng($this->_imageHandler);
                break;

            case IMAGETYPE_XBM:
                imagexbm($this->_imageHandler);
                break;

            case IMAGETYPE_WBMP:
                imagewbmp($this->_imageHandler);
                break;

            default:
                throw new Exception("Unsupported image format.");
                break;
        }
    }

    public function resize($frameWidth = null, $frameHeight = null)
    {
        if(null === $frameWidth && null === $frameHeight) {
            throw new Exception('Invalid image dimensions.');
        }

        // setup initial image properties
        $srcWidth  = $this->_imageSrcWidth;
        $srcHeight = $this->_imageSrcHeight;
        $srcX = 0;
        $srcY = 0;
        $dstX = 0;
        $dstY = 0;
        $keepAspectRatio = (bool)$this->_keepProportion;
        $doFill          = (bool)$this->_fillOnResize;
        $fillColor       = $this->_fillColorOnResize;

        // get rid of one of dimensions, if filling is disabled (!)
        if ((!$doFill) && $keepAspectRatio) {
            if ($frameWidth > $frameHeight) {
                $frameHeight = null;
            } else {
                $frameWidth = null;
            }
        }

        // calculate lacking dimension (width or height)
        if (null === $frameWidth) {
            $frameWidth = round($frameHeight * ($srcWidth / $srcHeight));
        }
        elseif (null === $frameHeight) {
            $frameHeight = round($frameWidth * ($srcHeight / $srcWidth));
        }

        // create new image
        $newImage = imagecreatetruecolor($frameWidth, $frameHeight);

        // define coordinates of image inside new frame
        $dstWidth  = $frameWidth;
        $dstHeight = $frameHeight;
        if ($doFill && $keepAspectRatio) {
            if ($srcWidth / $srcHeight >= $frameWidth / $frameHeight) {
                $dstHeight = round(($dstWidth / $srcWidth) * $srcHeight);
                $dstY = round(($frameHeight - $dstHeight) / 2);
            } else {
                $dstWidth = round(($dstHeight / $srcHeight) * $srcWidth);
                $dstX = round(($frameWidth - $dstWidth) / 2);
            }

            // fill new image frame (supports alpha transparency)
            list($r, $g, $b, $alpha) = $fillColor;
            if (null !== $alpha) {
                $backgroundColor = imagecolorallocatealpha($newImage, $r, $g, $b, abs($alpha));
            } else {
                $backgroundColor = imagecolorallocate($newImage, $r, $g, $b);
            }
            imagefill($newImage, 0, 0, $backgroundColor);
            // imagefilledrectangle($newImage, 0, 0, $frameWidth, $frameHeight, $backgroundColor);
        }

        // resize soruce image and copy it to new frame
        imagecopyresampled($newImage, $this->_imageHandler, $dstX, $dstY, $srcX, $srcY, $dstWidth, $dstHeight, $srcWidth, $srcHeight);
        $this->_imageHandler = $newImage;
        $this->refreshImageDimensions();
    }

    public function rotate($angle)
    {
        $this->_imageHandler = imagerotate($this->_imageHandler, $angle, $this->imageBackgroundColor);
        $this->refreshImageDimensions();
    }

    public function watermark($watermarkImage, $positionX=0, $positionY=0, $watermarkImageOpacity=30, $repeat=false)
    {
        list($watermarkSrcWidth, $watermarkSrcHeight, $watermarkFileType, ) = getimagesize($watermarkImage);
        $this->_getFileAttributes();
        switch( $watermarkFileType ) {
            case IMAGETYPE_GIF:
                $watermark = imagecreatefromgif($watermarkImage);
                break;

            case IMAGETYPE_JPEG:
                $watermark = imagecreatefromjpeg($watermarkImage);
                break;

            case IMAGETYPE_PNG:
                $watermark = imagecreatefrompng($watermarkImage);
                break;

            case IMAGETYPE_XBM:
                $watermark = imagecreatefromxbm($watermarkImage);
                break;

            case IMAGETYPE_WBMP:
                $watermark = imagecreatefromxbm($watermarkImage);
                break;

            default:
                throw new Exception("Unsupported watermark image format.");
                break;
        }

        if( $this->getWatermarkWidth() && $this->getWatermarkHeigth() && ($this->getWatermarkPosition() != self::POSITION_STRETCH) ) {
            $newWatermark = imagecreatetruecolor($this->getWatermarkWidth(), $this->getWatermarkHeigth());
            imagealphablending($newWatermark, false);
            $col = imagecolorallocate($newWatermark, 255, 255, 255);
            imagefilledrectangle($newWatermark, 0, 0, $this->getWatermarkWidth(), $this->getWatermarkHeigth(), $col);
            imagealphablending($newWatermark, true);

            imagecopyresampled($newWatermark, $watermark, 0, 0, 0, 0, $this->getWatermarkWidth(), $this->getWatermarkHeigth(), imagesx($watermark), imagesy($watermark));
            $watermark = $newWatermark;
        }

        if( $this->getWatermarkPosition() == self::POSITION_TILE ) {
            $repeat = true;
        } elseif( $this->getWatermarkPosition() == self::POSITION_STRETCH ) {
            $newWatermark = imagecreatetruecolor($this->_imageSrcWidth, $this->_imageSrcHeight);
            imagealphablending($newWatermark, false);
            $col = imagecolorallocate($newWatermark, 255, 255, 255);
            imagefilledrectangle($newWatermark, 0, 0, $this->_imageSrcWidth, $this->_imageSrcHeight, $col);
            imagealphablending($newWatermark, true);

            imagecopyresampled($newWatermark, $watermark, 0, 0, 0, 0, $this->_imageSrcWidth, $this->_imageSrcHeight, imagesx($watermark), imagesy($watermark));
            $watermark = $newWatermark;
        } elseif( $this->getWatermarkPosition() == self::POSITION_TOP_RIGHT ) {
            $positionX = ($this->_imageSrcWidth - imagesx($watermark));
            imagecopymerge($this->_imageHandler, $watermark, $positionX, $positionY, 0, 0, imagesx($watermark), imagesy($watermark), $watermarkImageOpacity);
        } elseif( $this->getWatermarkPosition() == self::POSITION_BOTTOM_RIGHT ) {
            $positionX = ($this->_imageSrcWidth - imagesx($watermark));
            $positionY = ($this->_imageSrcHeight - imagesy($watermark));
            imagecopymerge($this->_imageHandler, $watermark, $positionX, $positionY, 0, 0, imagesx($watermark), imagesy($watermark), $watermarkImageOpacity);
        } elseif( $this->getWatermarkPosition() == self::POSITION_BOTTOM_LEFT ) {
            $positionY = ($this->_imageSrcHeight - imagesy($watermark));
            imagecopymerge($this->_imageHandler, $watermark, $positionX, $positionY, 0, 0, imagesx($watermark), imagesy($watermark), $watermarkImageOpacity);
        }

        if( $repeat === false ) {
            imagecopymerge($this->_imageHandler, $watermark, $positionX, $positionY, 0, 0, imagesx($watermark), imagesy($watermark), $watermarkImageOpacity);
        } else {
            $offsetX = $positionX;
            $offsetY = $positionY;
            while( $offsetY <= ($this->_imageSrcHeight+imagesy($watermark)) ) {
                while( $offsetX <= ($this->_imageSrcWidth+imagesx($watermark)) ) {
                    imagecopymerge($this->_imageHandler, $watermark, $offsetX, $offsetY, 0, 0, imagesx($watermark), imagesy($watermark), $watermarkImageOpacity);
                    $offsetX += imagesx($watermark);
                }
                $offsetX = $positionX;
                $offsetY += imagesy($watermark);
            }
        }
        imagedestroy($watermark);
        $this->refreshImageDimensions();
    }

    public function crop($top=0, $bottom=0, $right=0, $left=0)
    {
        if( $left == 0 && $top == 0 && $right == 0 && $bottom == 0 ) {
            return;
        }

        $newWidth = $this->_imageSrcWidth - $left - $right;
        $newHeight = $this->_imageSrcHeight - $top - $bottom;

        $canvas = imagecreatetruecolor($newWidth, $newHeight);

        if ($this->_fileType == IMAGETYPE_PNG) {
            $this->_saveAlpha($canvas);
        }

        imagecopyresampled($canvas, $this->_imageHandler, $top, $bottom, $right, $left, $this->_imageSrcWidth, $this->_imageSrcHeight, $newWidth, $newHeight);

        $this->_imageHandler = $canvas;
        $this->refreshImageDimensions();
    }

    public function checkDependencies()
    {
        foreach( $this->_requiredExtensions as $value ) {
            if( !extension_loaded($value) ) {
                throw new Exception("Required PHP extension '{$value}' was not loaded.");
            }
        }
    }

    private function refreshImageDimensions()
    {
        $this->_imageSrcWidth = imagesx($this->_imageHandler);
        $this->_imageSrcHeight = imagesy($this->_imageHandler);
    }

    function __destruct()
    {
        imagedestroy($this->_imageHandler);
    }

    /*
     * Fixes saving PNG alpha channel
     */
    private function _saveAlpha($imageHandler)
    {
        $background = imagecolorallocate($imageHandler, 0, 0, 0);
        ImageColorTransparent($imageHandler, $background);
        imagealphablending($imageHandler, false);
        imagesavealpha($imageHandler, true);
    }
}