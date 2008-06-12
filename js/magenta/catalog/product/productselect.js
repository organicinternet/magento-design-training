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
Mage.Catalog_Product_ProductSelect = function(config) {
    this.gridPageSize = 30;
    this.gridUrl = '/';
    this.loaded = false;
    
    if (config && config.el) {
        this.el = config.el;
    } else {
        this.el = Ext.DomHelper.append(document.body, {tag:'div'}, true);
    }
    
    Ext.apply(this, config);
    

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
            alwaysShowTabs: false
        }
    });
    
    this.layout = this.dialog.getLayout();

    var innerLayout = new Ext.BorderLayout(this.layout.getEl().createChild({tag : 'div'}), {
        west: {
            initialSize: 200,
            autoScroll:true,
            split:true
        },
        center: {
            autoScroll:true
        }
    });
    innerLayout.beginUpdate();
    var treePanel = innerLayout.add("west", new Ext.ContentPanel(innerLayout.getEl().createChild({tag : 'div'})));
    
    /*####################### INIT Category Tree ####################*/ 
        var treeContainer = treePanel.getEl().createChild({tag:'div'});
        this.tree = new Ext.tree.TreePanel(treeContainer, {
            animate:true, 
            loader: new Ext.tree.TreeLoader({dataUrl: Mage.url + 'category/treeChildren/'}),
            enableDD:false,
            containerScroll: true,
            rootVisible : true
        });
        
        var mask = new Ext.LoadMask(innerLayout.getRegion('west').getEl(), {
            store : this.tree
        });
        
        var sm = this.tree.getSelectionModel();
        sm.on('selectionchange', function(){
            var node = sm.getSelectedNode();
            this.loadGrid({
                catId : node.id
            });
        }.createDelegate(this));     
                   
        var root = new Ext.tree.AsyncTreeNode({
            id : 1,
            text: 'Catalog Categories', 
            draggable : false,
            expanded : false
        });
        
        this.tree.setRootNode(root);
        this.tree.render();
 
    /*####################### END INIT Category Tree ####################*/ 
    
    
    /*####################### INIT GRID ####################*/ 
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
                proxy: new Ext.data.HttpProxy({url : this.gridUrl}),
                reader: dataReader,
                remoteSort: true
             });

            var colModel = new Ext.grid.ColumnModel([
                {header: "ID#", sortable: true, locked:false, dataIndex: 'id'},
                {header: "Name", sortable: true, dataIndex: 'name'},
                {header: "Price", sortable: true, renderer: Ext.util.Format.usMoney, dataIndex: 'price'},
                {header: "Description", sortable: false, dataIndex: 'description'}
            ]);

            this.grid = new Ext.grid.Grid(innerLayout.getRegion('center').getEl().createChild({tag : 'div'}), {
                ds: dataStore,
                cm: colModel,
                autoSizeColumns : true,
                loadMask: true,
                monitorWindowResize : true,
                autoHeight : false,
                selModel : new Ext.grid.RowSelectionModel({singleSelect : false}),
                enableColLock : false
            });
            
           innerLayout.add("center", new Ext.GridPanel(this.grid));    
           
           this.grid.render();  
           
           var gridHead = this.grid.getView().getHeaderPanel(true);
           var gridFoot = this.grid.getView().getFooterPanel(true);

           var paging = new Ext.PagingToolbar(gridHead, this.grid.getDataSource(), {
               pageSize: this.gridPageSize,
               displayInfo: true,
               displayMsg: 'Products {0} - {1} of {2}',
               emptyMsg: 'No items to display'
           });

    /*####################### END GRID ####################*/ 
    innerLayout.endUpdate(true);
    
    
    this.loadGrid = function(config) {
        if (!config || !config.catId) {
            var catId = 1;
        } else {
            var catId = config.catId;
        }
        this.grid.getDataSource().proxy.getConnection().url = this.gridUrl + 'category/'+catId + '/';
        this.grid.getDataSource().load();
    };

    this.layout.beginUpdate();            
    
    this.layout.add("center", new Ext.NestedLayoutPanel(innerLayout));
    this.layout.endUpdate();                
    
    this.dialog.addKeyListener(27, this.dialog.hide, this.dialog);
    this.dialog.setDefaultButton(this.dialog.addButton("Close", this.dialog.hide, this.dialog));
    this.dialog.setDefaultButton(this.dialog.addButton("Add", this.addElements.createDelegate(this)));
    this.dialog.on('hide', function(){
        this.grid.getSelectionModel().clearSelections();
    }.createDelegate(this));
    
    Mage.Catalog_Product_ProductSelect.superclass.constructor.call(this);
};

Ext.extend(Mage.Catalog_Product_ProductSelect, Ext.util.Observable, {
   
    show : function() {
        this.dialog.show();
        if (!this.loaded) {
            this.tree.root.reload();
            this.loadGrid();
            this.loaded = true;
        }
    },
    
    hide : function() {
        this.dialog.hide();        
    }, 
    
    addElements : function() {
        if (!this.parentGrid) {
            Ext.MessageBox.alert('Error','Parent Grid is not Set');
            return false;
        }
        
        var sm = this.grid.getSelectionModel();
        var ds = this.parentGrid.getDataSource();
        var i = 0;        
        var data = [];
        for (i=0; i < ds.getCount(); i++) {
            data.push(ds.getAt(i).data.id);
        }

        var k = 0;
        for (i=0; i < sm.selections.items.length; i++) {
            if (data.indexOf(sm.selections.items[i].data.id) == -1) {
                var obj = new this.dataRecord(sm.selections.items[i].data);                
                ds.add(obj);
                k++;
            }
        }
        if (k == 1 || k == 0) {
            Ext.MessageBox.alert('Message','Added ' + k + ' record');
        } else {
            Ext.MessageBox.alert('Message','Added ' + k + ' records');            
        }
    }
});
