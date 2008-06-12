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
Mage.form.FileField = function(config) {
    Ext.apply(this, config);
    Mage.form.FileField.superclass.constructor.call(this, config);
}

Ext.extend(Mage.form.FileField, Ext.form.Field, {
    inputType: 'file',
    
     onRender : function(ct, position){
        Mage.form.FileField.superclass.onRender.call(this, ct, position);
        if (this.autoSubmit == true && this.form) {
            this.on('change', function() {
                this.form.submit({waitMsg:'Upload File...'});    
            }.createDelegate(this));
        }
     }
})