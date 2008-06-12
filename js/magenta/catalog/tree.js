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
Mage.Catalog_Category_Tree = function(){
    var tree = null;
    var categoryContextMenu = null;

    return{
        loadChildrenUrl: Mage.url+'category/treeChildren/',
        moveNodeUrl: Mage.url+'category/move/',
        removeNodeUrl: Mage.url+'category/remove/',
        loadWebsiteUrl: Mage.url+'category/treeWebsite/',
        websiteListUrl : Mage.url + 'website/list/',
        tree: null,
        websiteId: null,
        btns : null,
        categoryForm : new Mage.Catalog_CategoryForm(),

        create: function(panel){
            if (!this.tree) {
                Ext.QuickTips.init();
                var layout = Mage.Catalog.getLayout('tree');
                var baseEl = layout.getEl().createChild({tag:'div'});
                var tb = new Ext.Toolbar(baseEl.createChild({tag:'div'}));
                var treeContainer = baseEl.createChild({tag:'div'});
                
                var ds = new Ext.data.Store({
                    proxy: new Ext.data.HttpProxy({
                        url: this.websiteListUrl
                    }),
                    reader: new Ext.data.JsonReader({id: 'value'}, [
                        {name: 'value', mapping: 'value'},
                        {name: 'text', mapping: 'text'}
                    ])
                });
                /*
                var websitesCombo = new Ext.form.ComboBox({
                    store : ds,
                    displayField :'text',
                    valueField : 'value',
                    typeAhead: false,
                    value : 'All websites',
                    disableKeyFilter : true,
                    editable : false,
                    triggerAction : 'all',
                    loadingText: 'Loading...'
                });

                websitesCombo.on('select', this.setWebsite, this);

                tb.addField(websitesCombo);
                */
                tb.addButton ({
                    text: 'Add',
                    id : 'add',
                    disabled : true,
                    handler : this.onAddCategory.createDelegate(this),
                    cls: 'x-btn-text-icon btn-add'
                });

                tb.addButton ({
                    text: 'Edit',
                    id : 'edit',
                    disabled : true,
                    handler : this.onEditCategory.createDelegate(this),
                    cls: 'x-btn-text-icon btn-folder-edit'
                });
                
                tb.addButton ({
                    text: 'Delete',
                    id : 'del',
                    disabled : true,
                    handler : this.deleteCategoryConfirm.createDelegate(this),
                    cls: 'x-btn-text-icon btn-delete'
                });

                this.btns = tb.items.map;
                
                
                categoryContextMenu = new Ext.menu.Menu({
                        id : 'category_context_menu',
                        items: [{text: 'Show Category Products', handler: this.showProducts.createDelegate(this)},
                                '-',
                                //{text: 'Add child',handler:this.addChild.createDelegate(this)},
                                //{text: 'Edit Catecory',handler:this.editCategory.createDelegate(this)},
                                {text: 'Add child',handler:this.onAddCategory.createDelegate(this)},
                                {text: 'Edit Catecory',handler:this.onEditCategory.createDelegate(this)},
                                {text: 'Delete Category',handler:this.deleteCategoryConfirm.createDelegate(this)}]
                });

                var treePanel = layout.add('center', new Ext.ContentPanel(baseEl, {
                    fitToFrame:true,
                    autoScroll:true,
                    autoCreate:true,
                    toolbar: tb,
                    resizeEl:treeContainer
                }));
                
                
                var viewEl = treeContainer.createChild({tag:'div'});
                this.tree = new Ext.tree.TreePanel(viewEl, {
                    animate:true, 
                    loader: new Ext.tree.TreeLoader({dataUrl:this.loadWebsiteUrl}),
                    enableDD:true,
                    containerScroll: true,
                    rootVisible:false
                });
                
                var sm = this.tree.getSelectionModel();
                sm.on('selectionchange', function(){
                     this.btns.add.setDisabled(false);
                     if (this.tree.getSelectionModel().getSelectedNode() && this.tree.getSelectionModel().getSelectedNode().id != '1') {
                         this.btns.edit.setDisabled(false);
                         this.btns.del.setDisabled(false);
                     } else {
                         this.btns.edit.setDisabled(true);
                         this.btns.del.setDisabled(true);
                     }
                }.createDelegate(this));                
                
                
                this.tree.addListener('contextmenu',this.categoryRightClick,this);
                this.tree.addListener('click',this.categoryClick.createDelegate(this));
                this.tree.addListener('dblclick',this.categoryDblClick,this);
                this.tree.addListener('beforenodedrop', this.moveNode, this);

                var root = new Ext.tree.AsyncTreeNode({
                    text: 'root', 
                    draggable:false,
                    expanded:false
                });
                this.tree.setRootNode(root);
                this.tree.render();
                this.loadWebsiteRoot();
            }
        },

        onAddCategory : function(btn, event) {
            var sm = this.tree.getSelectionModel();
            this.categoryForm.show({catId : sm.getSelectedNode().id, isNew : 1});
        },

        onEditCategory : function(btn, event) {
            var sm = this.tree.getSelectionModel();
            this.categoryForm.show({catId : sm.getSelectedNode().id});
        },


        setWebsite: function(select, record){
            this.loadWebsiteRoot(record.id);
            this.websiteId = record.id;
        },

        loadWebsiteRoot: function(websiteId){
            this.tree.loader.dataUrl = this.loadWebsiteUrl;
            this.tree.loader.baseParams.website = websiteId;
            this.tree.root.reload();
            this.tree.loader.dataUrl = this.loadChildrenUrl;
        },

        addChildDialog: function(){
        
        },

        moveNode: function(obj){
            var data = {
                id: obj.dropNode.id
            }
            
            data.point = obj.point;
            switch (obj.point) {
                case 'above' :
                    data.pid = obj.target.parentNode.id;
                    if (obj.target.previousSibling) {
                        data.aid = obj.target.previousSibling.id;
                    } else {
                        data.aid = 0;
                    }
                    break;
                case 'below' :
                    data.pid = obj.target.parentNode.id;
                    data.aid = obj.target.id;
                break;
                case 'append' :
                    data.pid = obj.target.id;
                    if (obj.target.lastChild) {
                        data.aid = obj.target.lastChild.id;
                    } else {
                        data.aid = 0;
                    }
                break;
                default :
                    obj.cancel = true;
                    return obj;
            }

            var success = function(o) {
                try { eval(o.responseText); } catch(e) { Ext.dump(e); }
            };
            var failure = function(o) {
                Ext.dump(o.statusText);
            };

            var pd = [];
            for(var key in data) {
                pd.push(encodeURIComponent(key), "=", encodeURIComponent(data[key]), "&");
            }
            pd.splice(pd.length-1,1);
            var con = new Ext.lib.Ajax.request('POST', this.moveNodeUrl, {success:success,failure:failure, scope:obj}, pd.join(""));
        },

        editNodeDialog: function(){
        
        },
        
        deleteCategoryConfirm: function(item, event){
            Ext.MessageBox.confirm('Tree Message', 'Are you sure ?', this.deleteCategory, this);
        },

        deleteCategory: function(flag){
            if (flag == 'yes') {
                var node = this.tree.getSelectionModel().getSelectedNode();
                var success = function(o) { this.parentNode.removeChild(this);};
                var failure = function(o) { Ext.dump(o.statusText); };
                var con = new Ext.lib.Ajax.request('GET', this.removeNodeUrl+'id/'+node.id+'/', {success:success,failure:failure,scope:node});
            }
        },

        categoryRightClick: function(node, event){
            categoryContextMenu.selectedNode = node;
            node.select();
            categoryContextMenu.showAt(event.getXY(),categoryContextMenu.parentMenu,false);
        },

        categoryDblClick: function(){
            
        },
        
        categoryClick: function(node, e){
            if (categoryContextMenu){
                categoryContextMenu.hide();
            }
            this.showProducts(null, e, node);
        },
            
        //////////////// Context menu handlers /////////////
        showProducts: function(item, event, selectedNode) {
            if (selectedNode) {
                //Mage.Catalog_Product_Grid.load(selectedNode.id, selectedNode.text);
                Mage.Catalog_Product.viewGrid({load: true, catId: selectedNode.id, catTitle: selectedNode.text});        
                //Mage.Catalog_Product.loadCategoryEditForm(selectedNode);
                //Mage.Catalog_Category.init(selectedNode);
            } else {
                Mage.Catalog_Product.viewGrid({load: true, catId: item.parentMenu.selectedNode.id, catTitle: item.parentMenu.selectedNode.text});        
                Mage.Catalog_Product.loadCategoryEditForm(item.parentMenu.selectedNode);                
                //Mage.Catalog_Category.init(item.parentMenu.selectedNode);                
            }
        },

        addChild: function(item, event) {
            //addChildDialog(item);
        },

        editCategory: function(item,event){
            alert('edit category');
        }
    }
}();