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
Mage.Sales_Price_Rules = function() {
    Mage.Sales_Price_Rules.superclass.constructor.call(this);
};

Ext.extend(Mage.Sales_Price_Rules, Ext.util.Observable, {
    dialog : false,
    el : false,
    treeUrl : Mage.url + 'category/form/',
    formUrl : Mage.url + 'category/form/',
    conn : null,
    panel : null,
    
    init : function(admin) {
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
                west: {
                    split:true,
                    initialSize: 150,
                    minSize: 100,
                    maxSize: 250,
                    titlebar: true,
                    collapsible: true,
                    animate: true
                },
                center: {
                    autoScroll:true,
                    tabPosition: 'top',
                    closeOnTab: true,
                    alwaysShowTabs: true
                }
            });
            this.dialog.addKeyListener(27, this.dialog.hide, this.dialog);
            this.dialog.setDefaultButton(this.dialog.addButton("Save", this.onSave, this));
            this.dialog.setDefaultButton(this.dialog.addButton("Close", this.dialog.hide, this.dialog));
            
        }
        this.dialog.setTitle('Loading...');
        //this.loadMask = new Ext.LoadMask(this.dialog.getLayout().getRegion('center').getEl());
        //this.loadMask.onBeforeLoad();
        this.dialog.show();
    },
    
    loadMainPanel: function(){
        this.init();
    }
});

Mage.priceRules = new Mage.Sales_Price_Rules();