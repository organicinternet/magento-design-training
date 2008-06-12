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
Mage.core.PanelRelated = function(region, config) {
    this.region = region;
    this.notLoaded = true;
    this.saveVar = null;    
    this.dataRecord = null;
    this.grid = null;
    this.productSelector = null;
    this.panel = null;
    
    this.tbItems = new Ext.util.MixedCollection();
    Ext.apply(this, config);
    
    this.gridUrl = Mage.url + 'product/relatedList/';
    
    this.dataRecord = Ext.data.Record.create([
        {name: 'id', mapping: 'product_id'},
        {name: 'name', mapping: 'name'},
        {name: 'price', mapping: 'price'},
        {name: 'description', mapping: 'description'}
    ]);

    var dataReader = new Ext.data.JsonReader({
        root: 'items',
        totalProperty: 'totalRecords',
        id: 'product_id'
    }, this.dataRecord);
    
    
    var dataStore = new Ext.data.Store({
        proxy: new Ext.data.HttpProxy({url: this.gridUrl + 'product/' + this.record.data.id + '/'}),
        reader: dataReader,
        baseParams : {pageSize : this.gridPageSize},
        remoteSort: true
    });
             
    var colModel = new Ext.grid.ColumnModel([
        {header: "ID#", sortable: true, locked:false, dataIndex: 'id'},
        {header: "Name", sortable: true, dataIndex: 'name'},
        {header: "Price", sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
        {header: "Description", sortable: false, dataIndex: 'description'}
    ]);

    this.grid = new Ext.grid.Grid(this.region.getEl().createChild({tag : 'div'}), {
        ds: dataStore,
        cm: colModel,
        autoSizeColumns : true,
        loadMask: true,
        monitorWindowResize : true,
        autoHeight : false,
        selModel : new Ext.grid.RowSelectionModel({singleSelect : false}),
        enableColLock : false
    });

    this.productSelector = new Mage.Catalog_Product_ProductSelect({
        gridUrl : Mage.url + 'product/gridData/',
        parentGrid : this.grid,
        dataRecord : this.dataRecord
    });        

    
    this.panel = this.region.add(new Ext.GridPanel(this.grid, {
        background : true,
        fitToFrame : true,
        title : config.title || 'Title'
    }));
    
    this.panel.on('activate', function(){
        this.grid.render();
        this.grid.autoSize();
        this.grid.getDataSource().load();
        this.notLoaded = false;
    }, this, {single : true});

    this.panel.on('activate', function(){
        this._loadActions();
        if (this.notLoaded) {
            this.grid.getDataSource().proxy.getConnection().url = this.gridUrl + 'product/' + this.record.data.id + '/';
            this.grid.getDataSource().load();
            this.notLoaded = false;        
        }
    }, this);
    
    this.panel.on('deactivate', this._unLoadActions, this);    
    
};

Ext.extend(Mage.core.PanelRelated, Mage.core.Panel, {
    update : function(config) {
        Ext.apply(this, config);
        if (this.region.getActivePanel() === this.panel) {
            this.grid.getDataSource().proxy.getConnection().url = this.gridUrl + 'product/' + this.record.data.id + '/';        
            this.grid.getDataSource().load();
        } else {
            this.notLoaded = true;
        }
    },
    
    save : function() {
        if (!this.saveVar) {
            return false;
        }
        var data = {};
        var items = [];
        
        this.grid.getDataSource().each(function(){
            items.push(this.data.id);
        })
        
        if (items.length > 0) {
            data[this.saveVar] = items;
        } else {
            data[this.saveVar] = '';
        }
        return data;
    },
    
    _loadActions : function() {
        if (this.toolbar) {
            if (this.tbItems.getCount() == 0) {
                this.tbItems.add('related_sep', new Ext.Toolbar.Separator());
                this.tbItems.add('related_add', new Ext.Toolbar.Button({
                    text : 'Add Related Product',
                    handler : this._onAddItem,
                    scope : this
                }));
                this.tbItems.add('related_remove', new Ext.Toolbar.Button({
                    text : 'Remove Related Product',
                    handler : this._onRemoveItem,
                    scope : this
                }));
                
                this.tbItems.each(function(item){
                    this.toolbar.add(item);
                }.createDelegate(this));
            } else {
                this.tbItems.each(function(item){
                    item.show();
                }.createDelegate(this));
            }
        }
    },
    
    _onRemoveItem : function() {
       Ext.MessageBox.confirm('Warning','Are you sure ?', function(btn, text){
           if (btn == 'yes') {
               var sm = this.grid.getSelectionModel();
               while(sm.selections.items.length) {
                   this.grid.getDataSource().remove(sm.selections.items[0]);
               }
            }
        }.createDelegate(this))
    },
    
    _onAddItem : function() {
        this.productSelector.show();
    },
    
    _unLoadActions : function() {
        this.tbItems.each(function(item){
            item.hide();
        }.createDelegate(this));
    }
})