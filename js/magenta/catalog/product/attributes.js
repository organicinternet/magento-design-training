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
Mage.Catalog_Product_Attributes = function(){
    var loaded = false;
    var Layout = null;
    return {

        westLayout : null,
        btnEdit : null,
        btnDelete : null,

        attributeGrid : null,
        attributeGridToolbar : null,
        attributeGridUrl : Mage.url + 'product/attributeList/',
        attributeGridPropUrl : Mage.url + 'product/attributePropList/',
        attributesDeleteUrl : Mage.url + 'product/attributeDelete/',
        attributesCreateUrl : Mage.url + 'product/attributeCreate/',
        attributesCommitUrl : Mage.url + 'product/attributeSave/',

        addGroupAttributes : Mage.url + 'product/addGroupAttributes/',
        removeElementUrl : Mage.url + 'product/removElement/',        
        saveSetUrl : Mage.url + 'product/saveSet/',
        saveGroupUrl : Mage.url + 'product/saveGroup/',
        
        setTreeUrl : Mage.url + 'product/attributeSetTree/',
        moveNodeUrl : Mage.url + 'product/moveAttributeInSet/',

        setGrid : null,
        setGridUrl :  Mage.url + 'product/attributeSetList/',

        editSetGrid : null,
        editSetGridUrl : Mage.url + 'product/attributesetproperties/',
        stree : null,

        init : function() {
            var Core_Layout = Mage.Admin.getLayout();
            if (!Layout) {
                Layout =  new Ext.BorderLayout(Ext.DomHelper.append(Core_Layout.getEl(), {tag:'div'}, true), {
                    west: {
                        split:true,
                        initialSize : 300,
                        autoScroll:false,
                        collapsible:false,
                        titlebar:false
                    },
                    center : {
                        autoScroll : false,
                        titlebar : false,
                        hideTabs : false,
                        tabPosition : 'top'
                    }
                });

                this.westLayout = new Ext.BorderLayout(Layout.getRegion('west').getEl().createChild({tag:'div'}), {
                    center: {
                        split:true,
                        autoScroll:false,
                        collapsible:false,
                        titlebar:false
                    },
                    south : {
                        split:true,
                        hideWhenEmpty : true,
                        initialSize : 200,
                        autoScroll : false,
                        collapsible:false,
                        titlebar : false,
                        hideTabs : true
                    }
                });

         //       this.initSetGrid();

                this.initSetTree();
                
                Layout.beginUpdate();
                Layout.add('west', new Ext.NestedLayoutPanel(this.westLayout));
                Layout.endUpdate();

//                this.setGrid.getDataSource().load({params:{start:0, limit:10}});

                Core_Layout.beginUpdate();
                Core_Layout.add('center', new Ext.NestedLayoutPanel(Layout, {title:"Product Attributes",closable:false}));
                Core_Layout.endUpdate();
                
                this.loadAttributeGrid();

            } else {
                Mage.Admin.getLayout().getRegion('center').showPanel(Layout);
            }
        },

        initSetTree : function() {
            
                var sseed = 0;
                var gseed = 0;   
            
                var sview = Ext.DomHelper.append(Layout.getEl().dom,
                      {cn:[{id:'main-tb'},{id:'sbody'}]}
                );
                
                // create the primary toolbar
                var tb = new Ext.Toolbar('main-tb');
                tb.add({
                    id:'add',
                    text:'Set',
                    handler : addSet,
                    cls:'x-btn-text-icon b btn-add',
                    tooltip:'Add a new Set to the product attributes'
                }, {
                    id:'group',
                    text:'Group',
                    disabled:true,
                    handler:addGroup,
                    cls:'x-btn-text-icon btn-add',
                    tooltip:'Add a new group to the selected component'
                },'-',{
                    id:'remove',
                    text:'Remove',
                    disabled:true,
                    handler:removeHandler.createDelegate(this),
                    cls:'x-btn-text-icon btn-delete',
                    tooltip:'Remove the selected item'
                },'-',{
                    id:'reload',
                    text:'Reload',
                    disabled:false,
                    handler:refreshTree,
                    cls:'x-btn-text-icon btn-arrow-refresh',
                    tooltip:'Remove the selected item'
                });
                
                // for enabling and disabling
                var btns = tb.items.map;                
                
                this.westLayout.beginUpdate();
                this.westLayout.add('center', new Ext.ContentPanel(sview, { 
                    autoScroll:true,
                    fitToFrame:true,
                    toolbar: tb,
                    resizeEl:'sbody'
                }));
                this.westLayout.endUpdate();
                

                var stree = new Ext.tree.TreePanel('sbody', {
                    animate:true,
                    enableDD:true,
                    containerScroll: true,
                    lines:false,
                    rootVisible:false,
                    loader:new Ext.tree.TreeLoader({
                        dataUrl: this.setTreeUrl
                    })
                });                
                
                this.stree = stree;                
                
                
                stree.on('nodedragover', function(e){
                    var ta = e.target.attributes;

                    if (!e.dropNode) {
                        if ((ta.type == 'group' && e.point == 'append') ||
                            (ta.type == 'attribute' && e.point != 'append')) { 
                            return true;
                        } else {
                            return false;
                        }
                    }  
                    
                    if (ta.isGeneral && e.point === 'above') {
                        return false;
                    }
                    
                    var na = e.dropNode.attributes;

                    if (
                       (na.setId === ta.setId && na.type == 'group' && ta.type == 'set' && e.point == 'append') ||
                       (na.setId === ta.setId && na.type == 'group' && ta.type == 'group' && e.point != 'append') ||
                       (na.setId === ta.setId && na.type == 'attribute' && ta.type == 'group' && e.point == 'append' && na.groupId != ta.groupId) ||
                       (na.setId === ta.setId && na.type == 'attribute' && ta.type == 'attribute' && e.point != 'append')
                     ) {
                        return true;
                     } else {
                        return false;
                     }
                });
                
                stree.on('beforenodedrop', function(e){
                    var data = {};
                    
                    data.point = e.point;
                   
                    switch (e.point) {
                        case 'above' :
                            data.pid = e.target.parentNode.id;
                            if (e.target.previousSibling) {
                                data.aid = e.target.previousSibling.id;
                            } else {
                                data.aid = 0;
                            }
                            break;
                        case 'below' :
                            data.pid = e.target.parentNode.id;
                            data.aid = e.target.id;
                        break;
                        case 'append' :
                            data.pid = e.target.id;
                            if (e.target.lastChild) {
                                data.aid = e.target.lastChild.id;
                            } else {
                                data.aid = 0;
                            }
                        break;
                        default :
                            e.cancel = true;
                            return e;
                    }
                        
                    if (e.dropNode) {
                        data.id = e.dropNode.id;

                        var success = function(o) {
                            
                            na = e.dropNode.attributes;
                            tpa = e.target.parentNode.attributes;
                            
                            if (na.groupId != tpa.groupId) {
                                na.id = 'set:'+na.setId+'/group:'+tpa.groupId+'/attr:'+na.attributeId;
                            }
                        };
                        var failure = function(o) {
                            Ext.dump(o.statusText);
                        };

                        var pd = [];
                        for(var key in data) {
                            pd.push(encodeURIComponent(key), "=", encodeURIComponent(data[key]), "&");
                        }
                        pd.splice(pd.length-1,1);
                        var con = new Ext.lib.Ajax.request('POST', this.moveNodeUrl, {success:success,failure:failure, scope:e}, pd.join(""));
                        
                        return true;
                    }
                    
                    var s = e.data.selections, r = [], flag = false;
                    
                    for(var i = 0, len = s.length; i < len; i++) {
                        var attributeId = s[i].data.attribute_id; // s[i] is a Record from the grid
                        var res = [];
                        
                        var node = null;
                        
                        if (e.point === 'append') {
                            node = e.target.parentNode;
                        } else {
                            node = e.target.parentNode.parentNode;
                        }
                        
                        if (node === null) {
                            return false;
                        }
                        
                        node.cascade(function() {
                            if (this.attributes.attributeId == attributeId) {
                                flag = true;
                                res.push(this);
                            }
                        });
                        
                        if (res.length == 0) {
                            var node = new Ext.tree.TreeNode({ // build array of TreeNodes to add
                                allowDrop : false,
                                allowDrag : true,
                                allowEdit : false,
                                allowDelete : false,
                                type : 'dropped',
                                cls : 'x-tree-node-loading',
                                text: s[i].data.attribute_code,
                                setId : e.target.attributes.setId,
                                groupId : e.target.attributes.groupId,
                                attributeId : attributeId,
                                iconCls : 'attr',
                                leaf : true,
                                allowChildren : false
                            });
                            r.push(node);
                        }
                    }

                    if (flag == true) {
                        Ext.MessageBox.alert('Warning','Some of attributes already exist in this set and weren\'t added.');
                    }
                    
                    if (r.length > 0) {
                    
                        var conn = new Ext.data.Connection();
                    
                        conn.on('requestcomplete', function(conn, response, options) {
                            var i = 0;
                            try {
                                var result =  Ext.decode(response.responseText);
                                if (result.error === 0) { 
                                    for(i=0; i < r.length; i++) {
                                        r[i].attributes.type = 'attribute';
                                        r[i].attributes.allowDelete = true;
                                        r[i].ui.removeClass('x-tree-node-loading');
                                    }
                                } else {
                                    for(i=0; i < r.length; i++) {
                                        if (result.errorNodes.indexOf(r[i].attributes.attributeId) >= 0) {
                                            r[i].parentNode.removeChild(r[i]);
                                        }
                                    }   
                                    Ext.MessageBox.alert('Error',result.errorMessage);
                                }
                            } catch (e){
                                for(i=0; i < r.length; i++) {
                                    r[i].parentNode.removeChild(r[i]);
                                }   
                                Ext.MessageBox.alert('Critical Error', response.responseText);
                            }
                            
                        });

                        conn.on('requestexception', function() {
                            Ext.MessageBox.alert('Critical Error', 'Request Eception');
                        });
                        
                        var requestParams = {};
                        requestParams.groupId = e.target.attributes.groupId;

                        var groupAttributes = [];
                        for (var i in r){
                            if (r[i].attributes && r[i].attributes.attributeId) {
                                groupAttributes.push(r[i].attributes.attributeId);
                            }
                        }
                        
                        requestParams.attributes = Ext.encode(groupAttributes);
                        requestParams.point = e.point;
                        
                        requestParams.sibling = -1;
                        if (e.point == 'below') {
                            requestParams.sibling = e.target.attributes.attributeId;
                        } else if (e.point == 'above') {
                            if (e.target.previousSibling) {
                                requestParams.sibling = e.target.previousSibling.attributes.attributeId;
                            } else {
                                requestParams.sibling = -1;
                            }
                        } else if (e.point == 'append') {
                            if (e.target.lastChild) {
                                requestParams.sibling = e.target.lastChild.attributes.attributeId;
                            } else {
                                requestParams.sibling = -1;
                            }
                        }
                        
                        conn.request( {
                            url: this.addGroupAttributes,
                            method: "POST",
                            params: requestParams
                        });
                    } else {
                        Ext.MessageBox.alert('Error', 'The attribute already exists in set.');
                    }                     
                    e.dropNode = r;  // return the new nodes to the Tree DD
                    e.cancel = r.length < 1; // cancel if all nodes were duplicates
                }.createDelegate(this));    
                
                //stree.el.addKeyListener(Ext.EventObject.DELETE, removeNode);
                
                var croot = new Ext.tree.AsyncTreeNode({
                    allowDrag:true,
                    allowDrop:true,
                    id:'croot',
                    text:'Sets',
                    cls:'croot'
                });
                
                function refreshTree() {
                    croot.reload();
                }
                
                stree.setRootNode(croot);
                stree.render();
                croot.expand();                
                
                var sm = stree.getSelectionModel();
                sm.on('selectionchange', function(){
                    var n = sm.getSelectedNode();
                    if(!n){
                        btns.remove.disable();
                        btns.group.disable();
                        return;
                     }
                     var a = n.attributes;
                     btns.remove.setDisabled(!a.allowDelete);
                     btns.group.setDisabled(!a.setId);
                });                
                
                // semi unique ids across edits
                function guid(prefix){
                    return prefix+(new Date().getTime());
                }                
                
                
                function addSet(){
                    var id = guid('s-');
                    var text = 'Set '+(++sseed);
                    var node = createSet(id, text);
                    node.select();
                    ge.triggerEdit(node);
                }                              
                
                function createSet(id, text, groups){
                    var node = new Ext.tree.AsyncTreeNode({
                        text: text,
                        iconCls: 'set',
                        cls: 'set',
                        type:'set',                        
                        id: id,
                        setId:id,
                        leaf : false,
                        expanded : false,
                        allowDelete : true,
                        allowDrop : true,
                        allowDrag : true,
                        allowEdit : true
                    });

                    croot.appendChild(node);
                    return node;
                }
                
                function removeHandler() {
                    var n = sm.getSelectedNode();
                    if (!n) {
                        return false;
                    }
                    var a = n.attributes;
                    if (a.allowDelete) {
                        n.disable();
                        var conn = new Ext.data.Connection();
                    
                        conn.on('requestcomplete', function(conn, response, options) {
                            var i = 0;
                            var result =  Ext.decode(response.responseText);
                                if (result.error === 0) { 
                                    if (a.type == 'group') {
                                        while (n.childNodes.length) {
                                            n.childNodes[0].id = n.parentNode.firstChild.id + '/attr:' + n.childNodes[0].attributes.attributeId;
                                            n.parentNode.firstChild.appendChild(n.childNodes[0]);
                                        }
                                    }
                                    n.parentNode.removeChild(n);
                                } else {
                                    n.enable();
                                    Ext.MessageBox.alert('Error', result.errorMessage);
                                }
                        });

                        conn.on('requestexception', function() {
                            Ext.MessageBox.alert('Error', 'requestException');
                        });
                        
                        var requestParams = {};
                        requestParams.element = a.type;
                        switch (a.type) {
                            case 'set':
                                requestParams.setId = a.setId;
                                break;
                            case 'group':
                                requestParams.setId = a.setId;
                                requestParams.groupId = a.groupId;
                                break;
                            case 'attribute':
                                requestParams.setId = a.setId;
                                requestParams.groupId = a.groupId;
                                requestParams.attributeId = a.attributeId;
                                break;
                            default:
                                return false;
                        }

                        conn.request( {
                            url: this.removeElementUrl,
                            method: "POST",
                            params: requestParams
                        });                
                    }
                }
            
            // create the editor for the component tree
            var ge = new Ext.tree.TreeEditor(stree, {
                allowBlank:false,
                blankText:'A name is required',
                selectOnFocus:true
            });            
            
            ge.on('beforestartedit', function(){
                if(!ge.editNode.attributes.allowEdit){
                    return false;
                }
            });    
            
            ge.on('complete', function() {
                var node = ge.editNode;
                switch (node.attributes.type) {
                    case 'set':
                        var requestUrl = this.saveSetUrl;

                        var requestParams = {
                            code: ge.getValue(),
                            id: node.attributes.setId
                        };
                        break;
                    case 'group':
                        var requestUrl = this.saveGroupUrl;
                        var requestParams = {
                            code: ge.getValue(),
                            setId: node.attributes.setId,
                            id: node.attributes.groupId
                        };
                        break;
                    default:
                        return true;
                }
                
                var conn = new Ext.data.Connection();
                    
                conn.on('requestcomplete', function(conn, response, options) {
                    var i = 0;
                    var result =  Ext.decode(response.responseText);
                    if (result.error === 0) {
                        if (result.setId) {
                            node.attributes.setId = result.setId;
                            node.id = 'set:' + result.setId;
                            node.reload();
                        }
                        if (result.groupId) {
                            node.attributes.groupId = result.groupId;
                        }
                    } else {
                        node.parentNode.removeChild(node);
                        Ext.MessageBox.alert('Error', result.errorMessage);
                    }
               });

                conn.on('requestexception', function() {
                    Ext.MessageBox.alert('Error', 'requestException');
                });
                        
                conn.request( {
                    url: requestUrl,
                    method: "POST",
                    params: requestParams
                });                
            }.createDelegate(this));
            
            // add option handler
            function addGroup(btn, e){
                var n = sm.getSelectedNode();
                if ((typeof n.isLoaded == 'function') ) {
                    if (n.isLoaded()) {
                        var newnode = createGroup(n, 'Group'+(++gseed));
                        newnode.select();
                        ge.triggerEdit(newnode);
                    } else {
                        n.reload(addGroup);
                    }
                } else {
                    var newnode = createGroup(n, 'Group'+(++gseed));
                    ge.triggerEdit(newnode);
                }
            }

            function createGroup(n, text){
                
                var snode = stree.getNodeById('set:'+n.attributes.setId);
                var csetId = n.attributes.setId;
                var snode = null;
                croot.eachChild(function(node){
                    if (node.attributes.setId == csetId) {
                        snode = node;
                    }
                });

                var node = new Ext.tree.TreeNode({
                    text: text,
                    setId : n.attributes.setId,
                    iconCls:'folder',
                    type:'group',
                    allowDelete:true,
                    allowDrop : true,
                    allowDrag : true,
                    allowEdit : true,
                    id:guid('o-')
                });
                snode.appendChild(node);
                return node;
            }                     
        },

        loadAttributeGrid : function() {
            if (this.attributeGrid == null) {
                this.initAttributesGrid();
                Layout.beginUpdate();
                Layout.add('center', new Ext.GridPanel(this.attributeGrid));
                Layout.endUpdate();
                this.attributeGrid.getDataSource().load({params:{start:0, limit:10}});
            } else {
                this.attributeGrid.getDataSource().proxy.getConnection().url = this.attributeGridUrl;
                this.attributeGrid.getDataSource().load({params:{start:0, limit:10}});
            }
        },

        initAttributesGrid : function() {
            var dataRecord = Ext.data.Record.create([
                {name: 'attribute_id', mapping: 'attribute_id'},
                {name: 'attribute_code', mapping: 'attribute_code'},
                {name: 'data_input', mapping: 'data_input'},
                {name: 'data_type', mapping: 'data_type'},
                {name: 'data_saver', mapping: 'data_saver'},
                {name: 'data_source', mapping: 'data_source'},
                {name: 'editable', mapping: 'editable'},
                {name: 'required', mapping: 'required'},
                {name: 'searchable', mapping: 'searchable'},
                {name: 'comparable', mapping: 'comparable'},
                {name: 'multiple', mapping: 'multiple'}
            ]);

            var dataReader = new Ext.data.JsonReader({
                root: 'items',
                totalProperty: 'totalRecords',
                id: 'attribute_id'
            }, dataRecord);

            var dataStore = new Ext.data.Store({
                proxy : new Ext.data.HttpProxy({url: this.attributeGridUrl}),
                reader : dataReader,
                remoteSort: true
            });

            dataStore.setDefaultSort('attribute_id', 'asc');

            function formatBoolean(value){
                return (value === true) ? 'Yes' : 'No';  
            };            
            
            // shorthand alias
            var fm = Ext.form, Ed = Ext.grid.GridEditor;

            var codeEditor = new Ed(new fm.TextField({
                allowBlank: false,
                revertInvalid : true
            }));
               
            codeEditor.on('beforecomplete', function(editor, value, startvalue){
               if (value === '') {
                   this.attributeGrid.getDataSource().remove(editor.record);
               }
            }.createDelegate(this));
            
            var dataReader = new Ext.data.JsonReader({
                root: 'items',
                totalProperty: 'totalRecords',
                id: 'attribute_id'
            }, dataRecord);

            
            var colModel = new Ext.grid.ColumnModel([{
                header: "ID#",
                sortable: true,
                locked:false,
                dataIndex: 'attribute_id'
            },{
                header: "Attribute Code",
                sortable: true,
                dataIndex: 'attribute_code',
                editor: codeEditor
            },{
                header: "Input type",
                sortable: true,
                dataIndex: 'data_input',
                editor: new Ed(new Ext.form.ComboBox({
                   typeAhead: false,
                   editable:false,
                   triggerAction: 'all',
                   mode: 'remote',
                   store: Mage.Catalog_Product_Attributes_DropDownStore.get(this.attributeGridPropUrl, 'data_input'),
                   displayField : 'text',
                   lazyRender:true
                }))                
            },{
                header: "Data type",
                sortable: true,
                dataIndex: 'data_type',
                editor: new Ed(new Ext.form.ComboBox({
                   typeAhead: false,
                   editable:false,
                   triggerAction: 'all',
                   mode: 'remote',
                   store: Mage.Catalog_Product_Attributes_DropDownStore.get(this.attributeGridPropUrl, 'data_type'),
                   displayField : 'text',
                   lazyRender:true
                }))                
            },{
                header: "Saver",
                sortable: true,
                dataIndex: 'data_saver',
                editor: new Ed(new Ext.form.ComboBox({
                   typeAhead: false,
                   editable:false,
                   triggerAction: 'all',
                   mode: 'remote',
                   store: Mage.Catalog_Product_Attributes_DropDownStore.get(this.attributeGridPropUrl, 'data_saver'),
                   displayField : 'text',
                   lazyRender:true
                }))                
            },{
                header: "Source",
                sortable: true,
                dataIndex: 'data_source',
                editor: new Ed(new Ext.form.ComboBox({
                   typeAhead: false,
                   editable:false,
                   triggerAction: 'all',
                   mode: 'remote',
                   store: Mage.Catalog_Product_Attributes_DropDownStore.get(this.attributeGridPropUrl, 'data_source'),
                   displayField : 'text',
                   lazyRender:true
                }))                
            },{
                header: "Required",
                sortable: true,
                dataIndex: 'required',
                renderer: formatBoolean,
                editor: new Ed(new fm.Checkbox())
            },{
                header: "Searchable",
                sortable: true,
                dataIndex: 'searchable',
                renderer: formatBoolean,
                editor: new Ed(new fm.Checkbox())
            },{
                header: "Comparable",
                sortable: true,
                dataIndex: 'comparable',
                renderer: formatBoolean,
                editor: new Ed(new fm.Checkbox())
            },{
                header: "Multiple",
                sortable: true,
                dataIndex: 'multiple',
                renderer: formatBoolean,
                editor: new Ed(new fm.Checkbox())
            }]);
            
            var ProductAttribute = Ext.data.Record.create([
               {name: 'attribute_id', type: 'string'},
               {name: 'attribute_code', type: 'string'},
               {name: 'data_input'},
               {name: 'data_type'},
               {name: 'required'}
            ]);

            this.attributeGrid = new Ext.grid.EditorGrid(Ext.DomHelper.append(Layout.getEl().dom, {tag: 'div'}, true), {
                ds: dataStore,
                cm: colModel,
                loadMask : true,
                enableDragDrop : true,
                autoSizeColumns : true,
                monitorWindowResize : true,
                ddGroup : 'TreeDD',
                trackMouseOver: false,
                autoHeight : true,
                selModel : new Ext.grid.RowSelectionModel({singleSelect : false}),
                enableColLock : false
            });
            
            
            this.attributeGrid.on('afteredit', function(e) {
                
                if (e.record.data.attribute_id == '###') {
                   var conn = new Ext.data.Connection();
                   var store = this.attributeGrid.getDataSource();
                     
                   conn.on('requestcomplete', function(transId, response, option) {
                       var result = Ext.decode(response.responseText);
                       if (result.error == 0) {
                          e.record.data.id = result.attributeId;
                          e.record.data.attribute_id = result.attributeId;
                          store.commitChanges();
                       } else {
                            Ext.MessageBox.alert('Error', result.errorMessage);                           
                            store.remove(e.record);
                       }

                   });

                   conn.on('requestexception', function(transId, response, option, e) {
                       Ext.MessageBox.alert('Error', 'Your changes could not be saved. The entry will be rolled back.');
                       store.rejectChanges();
                   });
           
                  conn.request( {
                       url: this.attributesCreateUrl,
                       method: "POST",
                       params: {attribute: Ext.encode(e.record.data)}
                  });                
                }
            }.createDelegate(this));
            
            this.attributeGrid.on('dragout', function(){
                alert('test');
            });
            
            this.attributeGrid.render();
            

            
            var gridHead = this.attributeGrid.getView().getHeaderPanel(true);
            var tb = new Ext.Toolbar(gridHead);
            
            tb.addButton({
                text : 'New',
                cls: 'x-btn-text-icon btn-add',
                handler : function(){
                    var pa = new ProductAttribute({
                        attribute_id : '###',
                        attribute_code: '',
                        data_input: 'text',
                        data_type: 'decimal',
                        required : false
                    });
                    this.attributeGrid.stopEditing();
                    dataStore.insert(0, pa);
                    this.attributeGrid.startEditing(0, 1);
                }.createDelegate(this)
            });
            
            tb.addButton({
                text : 'Save',
                cls: 'x-btn-text-icon btn-accept',
                handler : this.onSaveClick.createDelegate(this)
            });
            
            tb.addButton({
                text : 'Delete',
                cls: 'x-btn-text-icon btn-bin-closed',
                handler : function(){
                   var sm =  this.attributeGrid.getSelectionModel();
                   if (sm.hasSelection()) {
                       var cell = sm.selections;
                       var i = 0;
                       var data = [];
                       for (i=0; i< sm.selections.items.length; i++) {
                           data.push(sm.selections.items[i].id);
                       }
                       
                       var conn = new Ext.data.Connection();
                       
                       conn.on('requestcomplete', function(dm,response,option) {
                           var result = Ext.decode(response.responseText);
                           if (result.error == 0) {
                               while(sm.selections.items.length) {
                                   this.attributeGrid.getDataSource().remove(sm.selections.items[0]);
                                   this.stree.root.reload();
                               }
                           } else {
                               Ext.MessageBox.alert('Error', result.ErrorMessage);
                           }
                       }.createDelegate(this));
                       
                       conn.on('requestexception', function(dm, response, option, e) {
                            Ext.MessageBox.alert('Error', 'RequestException.');
                       });
                       
                       conn.request( {
                            url: this.attributesDeleteUrl,
                            method: "POST",
                            params: {
                              data: Ext.encode(data)
                           }
                       });                
                   }
                   
                }.createDelegate(this)
            });
            
            tb.addButton({
                text : 'Refresh',
                cls: 'x-btn-text-icon btn-arrow-refresh',
                handler : function() {
                    this.attributeGrid.getDataSource().load();
                }.createDelegate(this)
            });
        },
        
        onSaveClick : function() {
           var ds = this.attributeGrid.getDataSource();
           var i = 0;
           
           var data = {};              
           for(i=0; i < ds.modified.length; i++) {
               data[i] = ds.modified[i].data;
           }
            
           var conn = new Ext.data.Connection();
           
           conn.on('requestcomplete', function(transId, response, option) {
               var result = Ext.decode(response.responseText);
               if (result.error == 0) {
                  ds.commitChanges();
               } else {
                   ds.rejectChanges();                   
                   Ext.MessageBox.alert('Error', result.errorMessage);
               }
           });
           
                 conn.on('requestexception', function(transId, response, option, e) {
                         Ext.MessageBox.alert('Error', 'Your changes could not be saved. The entry will be rolled back.');
                         ds.rejectChanges();
                 });
                 
                 conn.request( {
                            url: this.attributesCommitUrl,
                                method: "POST",
                                params: {attributes:Ext.encode(data)}
                        });                
        },

        loadMainPanel : function() {
            this.init();
        }
    }
}();

Mage.Catalog_Product_Attributes_DropDownStore = function() {
    return {
        get : function(url, type) {
           var store = new Ext.data.Store({
               proxy: new Ext.data.HttpProxy({url: url}),                
               baseParams : {type : type},
               remoteSort : false,
               reader :  new Ext.data.JsonReader({
            root : 'items',
            totalProperty : 'totalRecords',
            id : 'id'
           }, Ext.data.Record.create([
                   {name: 'text'},
                   {name: 'value'},
              ]))
           });
           // store.load({method:'POST', params:{type: type}});
            return store;
        }
    }
}();