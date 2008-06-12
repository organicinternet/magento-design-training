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
Mage.core.ItemCard = function(config){
    this.panel = null;
    this.toolbar = null;
    this.toolbarItems = new Ext.util.MixedCollection();
    this.lastRecord = null;
    this.conn = null;
    this.tabs = new Ext.util.MixedCollection();
    this.result = null;
    this.saveUrl = null;
    
    Ext.apply(this, config);
    
    this.events = {
        'beforeloadrecord' : true,
        'loadrecord' : true
    }

    Mage.core.ItemCard.superclass.constructor.call(this);
}

Ext.extend(Mage.core.ItemCard, Ext.util.Observable,{
    
    createPanel : function() {
        if (!this.panel) {
            var layout = new Ext.BorderLayout(this.region.getEl().createChild({tag : 'div', id: 'item-card-panel'}), {
                    hideOnLayout:true,
                    north: {
                        split:false,
                        autoScroll:false,
                        titlebar:false,
                        collapsible:false
                     },
                     center:{
                         autoScroll : false,
                         titlebar : false,
                         resizeTabs : true,
                         preservePanel : true,
                         alwaysShowTabs : true,                         
                         tabPosition: 'top'
                     }                
            });
            var toolbarPanelBaseEl = layout.getRegion('north').getEl().createChild({tag : 'div', id: 'item-card-panel-toolbar-panel'});
            this.buildToolbar(toolbarPanelBaseEl.createChild({tag : 'div', id: 'item-card-panel-toolbar-panel-toolbar'}));
            layout.getRegion('north').add(new Ext.ContentPanel(toolbarPanelBaseEl));
            this.panel = new Ext.NestedLayoutPanel(layout, {
                closable : true,
                title : 'Loading...'
            });
        }
    },
    
    loadPanel : function(){
        this.createPanel();
//        if(Ext.isGecko && !this.region.isVisible()){
//            (function(){
//                this.center.getTabs().getActiveTab().bodyEl.dom.style.position = '';
//            }).defer(1, this);
//        }
        this.region.add(this.panel);
    },
    
    closePanel : function() {
        this.region.remove(this.panel);
    },
    
    buildToolbar : function(baseEl) {
        this.toolbar = new Ext.Toolbar(baseEl);
        this.toolbar.add(new Ext.ToolbarButton({
            text : 'Reload'
        }));
        this.toolbar.add(new Ext.ToolbarButton({
            text : 'Save',
            handler : this.onSave,
            scope : this
        }));
        for (i=0; i < this.toolbarItems.getCount(); i++) {
            this.toolbar.add(this.toolbarItems.get(i));
        }
    },
    
    toolbarAdd : function(obj) {
        this.toolbarItems.add(obj);
    },
    
    parseRecord : function(record) {
        
    },
    
    onSave : function() {
        var i,tab, data;
        data = {};
        for (i=0; i < this.tabs.getCount(); i++) {
            tab = this.tabs.itemAt(i);
            if (tab.isLoaded()) {
                Ext.apply(data, tab.save())
            }
        }
        var saveConn = new Ext.data.Connection();
        
        saveConn.on('requestcomplete', function(tranId, response, options) {
            var result = Ext.decode(response.responseText);
            if (result.error == 0) {
                Ext.MessageBox.alert('Product', 'Saved');
            } else {
                Ext.MessageBox.alert('XHR Error', result.errorMessage);
            }
        }.createDelegate(this));
        
        saveConn.request({
           url : this.saveUrl,
           params : data,
           method : 'POST'
        });
        
    },
    
    parseCardData : function(transId, response, options) {
        var i;
        this.result = Ext.decode(response.responseText);
        if (this.result.error && this.result.error != 0) {
            Ext.MessageBox.alert('Error', this.result.errorMessage);
            return false;
        }
        var panel;
        this.panel.setTitle(this.result.title || '');
        this.panel.getLayout().beginUpdate();
        this.saveUrl = this.result.saveUrl;
        for(i=0; i<this.result.tabs.length; i++) {
            this.result.tabs[i].record = this.lastRecord;
            if (panel = this.tabs.get(this.result.tabs[i].name)) {
                panel.update(this.result.tabs[i]);
            } else {
                this.result.tabs[i].toolbar = this.toolbar;
                this.tabs.add(this.result.tabs[i].name, new Mage.core.Panel(this.panel.getLayout().getRegion('center'), this.result.tabs[i].type, this.result.tabs[i]));
            }
        }
        this.panel.getLayout().endUpdate();        
        this.loadMask.onLoad();        
    },
    
    loadRecord : function(record) {
        if (this.lastRecord === record) {
            return true;
        }
        this.lastRecord = record;        
        this.loadPanel();
        this.panel.setTitle('Loading...');

        this.loadMask = new Ext.LoadMask(this.panel.getLayout().getEl());
        this.loadMask.onBeforeLoad();
        this.conn = new Ext.data.Connection();
        this.conn.on('requestcomplete', this.parseCardData.createDelegate(this));
        this.conn.on('requestexception', function() {
            Ext.MessageBox.alert('Critical Error', 'Request Exception');            
        });

        this.conn.request({
            url : this.url + this.lastRecord.id + '/',
            method : 'POST'
        })

    }
});
