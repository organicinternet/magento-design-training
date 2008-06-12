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
Mage.Catalog_CategoryForm = function(config){
    Ext.apply(this, config);
    Mage.Catalog_CategoryForm.superclass.constructor.call(this);
};

Ext.extend(Mage.Catalog_CategoryForm, Ext.util.Observable, {
     dialog : false,
     el : false,
     formUrl : Mage.url + 'category/form/',
     conn : null,
     panel : null,
    
     init : function() {
        this.conn = new Ext.data.Connection();
        this.conn.on('requestcomplete', this.connRequestComplete, this);
        this.conn.on('requestexception', function(){
            Ext.MessageBox.alert('Critical Error!!', 'request exception');
        });
        
        if (!this.dialog) {
            this.el = Ext.DomHelper.append(document.body, {tag:'div'}, true);
            this.dialog = new Ext.LayoutDialog(this.el, { 
                modal: true,
                width:600,
                height:450,
                shadow:true,
                minWidth:500,
                minHeight:350,
                autoTabs:true,
                proxyDrag:true,
                // layout config merges with the dialog config
                center:{
                    tabPosition: "top",
                    hideTabs : true,
                    alwaysShowTabs: false
                }
            });
            this.dialog.addKeyListener(27, this.dialog.hide, this.dialog);
            this.dialog.setDefaultButton(this.dialog.addButton("Save", this.onSave, this));
            this.dialog.setDefaultButton(this.dialog.addButton("Close", this.dialog.hide, this.dialog));
        }
        this.dialog.setTitle('Loading...');
        this.dialog.show();
        this.loadMask = new Ext.LoadMask(this.dialog.getLayout().getRegion('center').getEl());
        this.loadMask.onBeforeLoad();

        this.conn.request({
            url : this.formUrl,
            method : 'POST',
            params : {category_id : this.catId, isNew : this.isNew}
        });
    },
    
    onSave : function() {
        if (this.panel)  {
            var form = this.panel.getForm();
            if (form) {
                form.on('actioncomplete', function(){
                    //console.log('complete', arguments);
                });
                form.on('actionfailed', function(){
                    //console.log('failed', arguments);
                });
                form.submit();
            }
        }
    },
    
    
    
    connRequestComplete : function(transId, response, options) {
        var result = Ext.decode(response.responseText);
//        if (result.error == 0) {
            if (this.panel) {  
                result.panelConfig.background = false;            
                this.panel.update(result.panelConfig);
            } else {
                result.panelConfig.background = false;
                this.panel = new Mage.core.Panel(this.dialog.getLayout().getRegion('center'), 'form', result.panelConfig);
                this.dialog.getLayout().getRegion('center').showPanel(this.panel.getPanel());
            }
            this.dialog.setTitle(result.panelConfig.title || '');          
            this.loadMask.onLoad();
//        } else {
//            Ext.MessageBox.alert('Error', result.errorMessage);
//        }
    },
    
    show : function(config) {
        if (config) {
            this.catId = config.catId || 0;
            this.isNew = config.isNew || 0; // 0/1
        } else {
            this.catId = 0;
        }
        this.init();
    },

    hide : function() {
       this.dialog.hide();
    }
});
