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
Mage.Core_Media = function(){
    var mediaDialog = null;
    return {
        init: function(){
            Mage.Menu_Core.add('-');
            Mage.Menu_Core.add({
                text: 'Media',
                handler: Mage.Core_Media.showDialog.createDelegate(Mage.Core_Media)
            });
        },
        
        showDialog: function(){
            Ext.QuickTips.init();
            if (!mediaDialog) {
                mediaDialog = new Ext.LayoutDialog(Ext.id(), {
                    title:'Media Browser',
                    autoCreate : true,
                    width:700,
                    height:500,
                    minWidth:600,
                    minHeight:400,
                    syncHeightBeforeShow: true,
                    shadow:true,
                    fixedcenter:true,
                    west:{split:true, initialSize:300, collapsible:true},
                    center:{autoScroll:false, hideTabs:true}
                });
                mediaDialog.setDefaultButton(mediaDialog.addButton('Close', mediaDialog.hide, mediaDialog));

                var centerLayout = new Ext.BorderLayout(mediaDialog.getLayout().getEl().createChild({tag:'div'}), {
                     center:{
                         title:'Folder name here',
                         titlebar:true,
                         autoScroll:true,
                         hideTabs:true
                     },
                     south : {
                         hideWhenEmpty:false,
                         split:true,
                         initialSize:300,
                         minSize:50,
                         titlebar:true,
                         autoScroll:true,
                         collapsible:true,
                         hideTabs:true
                     }
                 });
                 var centerPanel = mediaDialog.getLayout().add('center', new Ext.NestedLayoutPanel(centerLayout, {autoCreate:true, fitToFrame:true}));
               
                 this.initTree();
            }

            mediaDialog.show();
        },
        
        initTree: function() {
            var layout = mediaDialog.getLayout();
            var media = layout.getEl().createChild({tag:'div', id:'media'});
            var tb = new Ext.Toolbar(media.createChild({tag:'div'}));

            var viewEl = media.createChild({tag:'div', id:'folders'});                
            
            var treePanel = layout.add('west', new Ext.ContentPanel(media, {
                title:'Media', 
                fitToFrame:true,
                autoScroll:true,
                autoCreate:true,
                toolbar: tb,
                resizeEl:viewEl
            }));
            
            var tree = new Ext.tree.TreePanel(viewEl, {
                animate:true, 
                loader: new Ext.tree.TreeLoader({dataUrl:Mage.url+'media/foldersTree/'}),
                enableDD:true,
                containerScroll: true,
                dropConfig: {appendOnly:true}
            });

            var root = new Ext.tree.AsyncTreeNode({
                text: 'Root', 
                draggable:false, // disable root node dragging
                id:'/'
            });

            tb.addButton({
                id:'add',
                text: 'New Folder',
                cls: 'x-btn-text-icon btn-add',
                disabled: true
            });
            tb.addButton({
                id:'remove',
                text: 'Remove Folder',
                cls: 'x-btn-text-icon btn-delete',
                disabled: true
            });
            tb.addButton({
                id:'reload',
                text:'Reload',
                handler:function(){root.reload()},
                cls:'x-btn-text-icon btn-arrow-refresh',
                tooltip:'Reload the tree'
            });
            btns = tb.items.map;
            
            var sm = tree.getSelectionModel();
            sm.on('selectionchange', function(){
                var n = sm.getSelectedNode();
                if(!n){
                    btns.add.disable();
                    btns.remove.disable();
                    return;
                 }
                 var a = n.attributes;
                 btns.add.setDisabled(false);
                 btns.remove.setDisabled(false);
            });

            tree.setRootNode(root);
            tree.render();
        },
        
        initGrid: function(path) {
            var dataRecord = Ext.data.Record.create([
                {name: 'id', mapping: 'product_id'},
                {name: 'name', mapping: 'name'},
                {name: 'price', mapping: 'price'},
                {name: 'description', mapping: 'description'}
            ]);

            var dataReader = new Ext.data.JsonReader({
                root: 'items',
                totalProperty: 'totalRecords',
                id: 'product_id'
            }, dataRecord);

             var dataStore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({url: Mage.url + 'product/gridData/category/' + catId + '/'}),
                reader: dataReader,
                remoteSort: true
             });
             
             dataStore.on('load', function(){
                 if (!this.filterSettings) {
                     this.loadFilterSettings();
                 }
             }.createDelegate(this));

            dataStore.setDefaultSort('product_id', 'desc');


            var colModel = new Ext.grid.ColumnModel([
                {header: "ID#", sortable: true, locked:false, dataIndex: 'id'},
                {header: "Name", sortable: true, dataIndex: 'name'},
                {header: "Price", sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
                {header: "Description", sortable: false, dataIndex: 'description'}
            ]);

            this.productsGrid = new Ext.grid.Grid(this.productLayout.getEl().createChild({tag: 'div'}), {
                ds: dataStore,
                cm: colModel,
                autoSizeColumns : true,
                loadMask: true,
                monitorWindowResize : true,
                autoHeight : true,
                selModel : new Ext.grid.RowSelectionModel({singleSelect : true}),
                enableColLock : false
            });
            
            this.productsGrid.mageCategoryId = catId;
            
            this.productsGrid.on('rowclick', this.createItem.createDelegate(this));

            this.productsGrid.render();

            var gridHead = this.productsGrid.getView().getHeaderPanel(true);
            var gridFoot = this.productsGrid.getView().getFooterPanel(true);

            var paging = new Ext.PagingToolbar(gridHead, dataStore, {
                pageSize: this.productsGridPageSize,
                displayInfo: true,
                displayMsg: 'Displaying products {0} - {1} of {2}',
                emptyMsg: 'No products to display'
            });

            var btnAdd = new Ext.Toolbar.Button({
                text: 'Filter',
                handler : this.addFilter.createDelegate(this),
                cls: 'x-btn-text-icon btn-add',
                disabled : true
             });
             paging.insertButton(0, btnAdd);
             this.filterButtons.add('add', btnAdd);
            
             var btnApply = new Ext.Toolbar.Button({
                text: 'Apply',
                handler : this.applyFilters.createDelegate(this),
                cls: 'x-btn-text-icon btn-accept',
                disabled : true
             });
             paging.insertButton(1, btnApply);            
             this.filterButtons.add('apply', btnApply);
             
             var bntReset = new Ext.Toolbar.Button({
                text: 'Reset',
                handler : this.deleteFilters.createDelegate(this),
                cls: 'x-btn-text-icon btn-delete',
                disabled : true
             });
             paging.insertButton(2, bntReset);            
             this.filterButtons.add('clear', bntReset);
             
             paging.insertButton(3, {
                text: 'Product',
                cls: 'x-btn-text-icon btn-package-add',
                handler : this.createItem.createDelegate(this)
             });
            
             paging.insertButton(4, new Ext.Toolbar.Separator());
        },
        
        /**
         *  @param : load  boolean (load grid data)
         *  @param : catId  integer (category id required)
         *  @param : catTitle string (category title required)
         */
        viewGrid : function (config) {
            if (!config.catId) {
                return false;
            }
            this.init();
            if (!this.productLayout) {
                this.initLayouts();
            }
            if (config.catTitle) {
                this.parentProductLayut.setTitle(config.catTitle);
            }
            
            if (!this.gridPanel) {
                this.initGrid(config.catId);
                this.productLayout.beginUpdate();
                this.gridPanel = this.productLayout.add('center', new Ext.GridPanel(this.productsGrid, {title: config.catTitle}));
                this.productLayout.endUpdate();
                if (config.load) {
                    this.productsGrid.getDataSource().load({params:{start:0, limit:this.productsGridPageSize}});
                }
            } else {
                this.gridPanel.getGrid();
                this.productsGrid.getDataSource().proxy.getConnection().url = Mage.url + 'product/gridData/category/' + config.catId + '/';
                if (config.load && this.productsGrid.mageCategoryId != config.catId) {
                    this.productsGrid.getDataSource().load({params:{start:0, limit:this.productsGridPageSize}});
                }
                this.productsGrid.mageCategoryId = config.catId;                
            }
        }
    }
}();

Mage.Core_Media.init();