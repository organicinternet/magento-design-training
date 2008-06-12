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



Mage.PermissionPanel = function(){
    return {
        panel : null,
        parentLayout : null,
        
        resourceTree : null,
        resourceGrid : null,
        resourceTreePanel : null,
        
        userTree : null,
        userGrid : null,
        userTreePanel : null,   
             
        roleTree : null,
        roleGrid : null,        
        roleTreePanel : null,        
        
        loadMainPanel : function() {
            this.parentLayout = Mage.Admin.getLayout();
            this.parentLayout.on('regionresized', function() {
                //console.log(arguments);    
            });
            
            
            if (!this.panel) {
                this.panel = this.buildPanel();
                this.parentLayout.beginUpdate();
                this.parentLayout.add('center', this.panel);
                
                this.buildUserTree(this.userTreePanel.getEl());
                this.buildRoleTree(this.roleTreePanel.getEl());
                this.buildResourceTree(this.resourceTreePanel.getEl());
                
                this.buildRoleGrid();
                this.buildResourceGrid();
                
                this.parentLayout.endUpdate();            
            } else {
                this.parentLayout.showPanel(this.panel);
            }
        },
        
        buildPanel : function() {
            var layout = new Ext.BorderLayout(Ext.DomHelper.append(document.body, {tag: 'div'}, true),{
                west: {
                    split:true,
                    autoScroll:true,
                    collapsible:false,
                    titlebar: true,
                    minSize : 200,
                    maxSize : 600,
                    initialSize: 200
                },
                center : {
                    autoScroll : false,
                    titlebar : true,
                    hideTabs:false,
                    minSize : 200                        
                },
                east : {
                    split:true,                        
                    autoScroll : false,
                    collapsible:false,                        
                    titlebar : true,
                    hideTabs:false,
                    minSize : 200,
                    maxSize : 600,
                    initialSize: 400
                }            
            });
            
            var westLayout = new Ext.BorderLayout(Ext.DomHelper.append(document.body, {tag: 'div'}, true),{
                center : {
                    autoScroll : false,
                    titlebar : false,
                    hideTabs:false,
                    minSize : 200                        
                },
                south : {
                    autoScroll : false,
                    titlebar : false,
                    hideTabs:false,
                    hideWhenEmpty : true,                    
                    minSize : 200                        
                }            
            });

            var centerLayout = new Ext.BorderLayout(Ext.DomHelper.append(document.body, {tag: 'div'}, true),{
                center : {
                    autoScroll : false,
                    titlebar : false,
                    hideTabs:false,
                    minSize : 200                        
                },
                south : {
                    autoScroll : false,
                    titlebar : false,
                    hideWhenEmpty : true,                    
                    hideTabs:false,
                    minSize : 200                        
                }            
            });

            var eastLayout = new Ext.BorderLayout(Ext.DomHelper.append(document.body, {tag: 'div'}, true),{
                center : {
                    autoScroll : false,
                    titlebar : false,
                    hideTabs:false,
                    minSize : 200                        
                },
                south : {
                    autoScroll : false,
                    titlebar : false,
                    hideTabs : false,
                    hideWhenEmpty : true,
                    minSize : 200                        
                }            
            });
            
            westLayout.beginUpdate();
            var userTreePanelEl = Ext.DomHelper.append(document.body, {tag:'div'}, true);
            var userTreePanelToolbar = new Ext.Toolbar(Ext.DomHelper.append(userTreePanelEl, {tag : 'div'}, true));
            userTreePanelToolbar.add({
                text : 'Reload',
                handler : function() {
                    this.userTree.root.reload();
                },
                scope : this
            });
            this.userTreePanel = westLayout.add('center', new Ext.ContentPanel(userTreePanelEl, {
                toolbar : userTreePanelToolbar
            }));
            westLayout.endUpdate();
            
            centerLayout.beginUpdate();
            var roleTreePanellEl = Ext.DomHelper.append(document.body, {tag:'div'}, true);
            var roleTreePanelToolbar = new Ext.Toolbar(Ext.DomHelper.append(roleTreePanellEl, {tag : 'div'}, true));
            roleTreePanelToolbar.add({
                text : 'Reload',
                handler : function() {
                    this.roleTree.root.reload();
                },
                scope : this
            });
            
            this.roleTreePanel = centerLayout.add('center', new Ext.ContentPanel(roleTreePanellEl, {
                toolbar : roleTreePanelToolbar
            }));
            centerLayout.endUpdate();
            
            eastLayout.beginUpdate();
            var resourceTreePanelEl = Ext.DomHelper.append(document.body, {tag:'div'}, true);
            var resourceTreePanelToolbar = new Ext.Toolbar(Ext.DomHelper.append(resourceTreePanelEl, {tag : 'div'}, true));
            resourceTreePanelToolbar.add({
                text : 'Reload',
                handler : function() {
                    this.resourceTree.root.reload();
                },
                scope : this
            });
            
            this.resourceTreePanel = eastLayout.add('center', new Ext.ContentPanel(resourceTreePanelEl, {
                toolbar : resourceTreePanelToolbar
            }));
            eastLayout.endUpdate();
           
            layout.beginUpdate();
            layout.add('west', new Ext.NestedLayoutPanel(westLayout, {title: 'Users'}));
            layout.add('center', new Ext.NestedLayoutPanel(centerLayout, {title: 'Groups & Roles', autoCreate: true}));
            layout.add('east', new Ext.NestedLayoutPanel(eastLayout, {title: 'Resources & Actions', autoCreate: true}));
            layout.endUpdate();                
            return new Ext.NestedLayoutPanel(layout, {title:"User & Permission", closable:false});
        },
        
        buildUserTree : function(el) {
           if (this.userTree) {
               return true;
           }
            
           this.userTree = new Ext.tree.TreePanel(el.createChild({tag:'div'}), {
                animate:true, 
                loader: new Ext.tree.TreeLoader({dataUrl:Mage.url + 'acl/userTree/'}),
                enableDD:true,
                containerScroll: true
            });  

            // set the root node
            var root = new Ext.tree.AsyncTreeNode({
                text: 'All Users',
                draggable:false,
                id:'U0'
            });
            this.userTree.setRootNode(root);

            // render the tree
            this.userTree.render();
            root.expand();            
        },
        
        
        buildRoleTree : function(el) {
            if (this.roleTree) {
                return true;
            }
            this.roleTree = new Ext.tree.TreePanel(el.createChild({tag:'div'}), {
                animate:true, 
                loader: new Ext.tree.TreeLoader({dataUrl:Mage.url + 'acl/roleTree/'}),
                enableDD:true,
                containerScroll: true
            });  

            // set the root node
            var root = new Ext.tree.AsyncTreeNode({
                text: 'All Groups',
                draggable:false,
                id:'G0'
            });
            this.roleTree.setRootNode(root);

            // render the tree
            this.roleTree.render();
            root.expand();            
            
        },

        buildRoleGrid : function() {
            if (this.roleGrid) {
                return true;
            }
            var region = this.panel.getLayout().getRegion('center').getActivePanel().getLayout().getRegion('south');
            
            this.roleDataRecord = Ext.data.Record.create([
                {name: 'id', mapping: 'user_id'},
                {name: 'user', mapping: 'user'}
            ]);

            var dataReader = new Ext.data.JsonReader({
                root: 'items',
                totalProperty: 'totalRecords',
                id: 'product_id'
            }, this.userDataRecord);

             var dataStore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({url: Mage.url + 'acl/roleGrid/'}),
                reader: dataReader,
                remoteSort: true
             });
             
             dataStore.on('load', function(){
                 if (!this.filterSettings) {
                     this.loadFilterSettings();
                 }
             }.createDelegate(this));

         //   dataStore.setDefaultSort('product_id', 'desc');


            var colModel = new Ext.grid.ColumnModel([
                {header: "ID#", filter : 'numeric', sortable: true, locked:false, dataIndex: 'id'},
                {header: "Name", filter : 'string', sortable: true, dataIndex: 'user'}
            ]);

            this.roleGrid = new Ext.grid.Grid(region.getEl().createChild({tag: 'div'}), {
                ds: dataStore,
                cm: colModel,
                autoSizeColumns : true,
                loadMask: true,
               	autoExpandColumn : 1,
                enableDragDrop : false,
                monitorWindowResize : true,
                autoHeight : false,
                selModel : new Ext.grid.RowSelectionModel({singleSelect : true}),
                enableColLock : false
            });
            
            region.add(new Ext.GridPanel(this.roleGrid));
            this.roleGrid.render();
            dataStore.load();            
        },

        
        buildResourceTree : function(el) {
            if (this.resourceTree) {
                return true;
            }
            
            this.resourceTree = new Ext.tree.TreePanel(el.createChild({tag:'div'}), {
                animate:true, 
                loader: new Ext.tree.TreeLoader({dataUrl:Mage.url + 'acl/resourceTree/'}),
                enableDD:true,
                containerScroll: true
            });  

            // set the root node
            var root = new Ext.tree.AsyncTreeNode({
                text: 'All Actions',
                draggable:false,
                id:'_'
            });
            this.resourceTree.setRootNode(root);

            // render the tree
            this.resourceTree.render();
            root.expand();            
        },   
        
        buildResourceGrid : function() {
            if (this.resourceGrid) {
                return true;
            }
            var region = this.panel.getLayout().getRegion('east').getActivePanel().getLayout().getRegion('south');
            
            this.resourceDataRecord = Ext.data.Record.create([
                {name: 'id', mapping: 'product_id'},
                {name: 'name', mapping: 'name'},
                {name: 'price', mapping: 'price'},
                {name: 'description', mapping: 'description'}
            ]);

            var dataReader = new Ext.data.JsonReader({
                root: 'items',
                totalProperty: 'totalRecords',
                id: 'product_id'
            }, this.userDataRecord);

             var dataStore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({url: Mage.url + 'acl/resourceGrid/'}),
                reader: dataReader,
                remoteSort: true
             });
             
             dataStore.on('load', function(){
                 if (!this.filterSettings) {
                     this.loadFilterSettings();
                 }
             }.createDelegate(this));

         //   dataStore.setDefaultSort('product_id', 'desc');


            var colModel = new Ext.grid.ColumnModel([
                {header: "Role/User", filter : 'numeric', sortable: true, locked:false, dataIndex: 'name'},
                {header: "Type", filter : 'string', sortable: true, dataIndex: 'type'},
                {header: "Access Level", filter : 'string', sortable: true, dataIndex: 'level'},
            ]);

            this.resourceGrid = new Ext.grid.Grid(region.getEl().createChild({tag: 'div'}), {
                ds: dataStore,
                cm: colModel,
                autoSizeColumns : true,
                loadMask: true,
                autoExpandColumn : 2,
                enableDragDrop : false,
                monitorWindowResize : true,
                autoHeight : false,
                selModel : new Ext.grid.RowSelectionModel({singleSelect : true}),
                enableColLock : false
            });
            
            region.add(new Ext.GridPanel(this.resourceGrid));
            this.resourceGrid.render();
            dataStore.load();
        },
    }
}();