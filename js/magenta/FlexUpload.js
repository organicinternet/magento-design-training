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
 * @copyright  Copyright (c) 2004-2007 Irubin Consulting Inc. DBA Varien (http://www.varien.com)
 * @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
Mage.FlexUpload = function () {
	Mage.FlexUpload.superclass.constructor.apply(this, arguments);
	this.loaded = false;
	this.events = {
		load : true,
		preinitialize: true,
		initialize: true,
		select: true,
		beforeupload: true,
		progress: true,
		afterupload: true
	};
	
	this.setAttributes( {
        "src" : Mage.url + "../media/flex/upload.swf"
    } );
	
	this.addListener( 'load', function(e) {
            this.loaded = true 
        } 
    );
};

Ext.extend( Mage.FlexUpload, Mage.FlexObject, {
	setConfig : function() {
		
		if (this.loaded && arguments.length > 1) {
			this.getApi().setConfig( arguments[0], arguments[1] );
		} else if (this.loaded && arguments.length == 1) {
			this.getApi().setConfig( arguments[0] );
		}
	}
} );