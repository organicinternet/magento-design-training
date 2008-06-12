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
/**
 * Create a DragZone instance for our JsonView
 */
ImageDragZone = function(view, config){
    this.view = view;
    //console.log(this.view);
    ImageDragZone.superclass.constructor.call(this, view.getEl(), config);
};
Ext.extend(ImageDragZone, Ext.dd.DragZone, {
    // We don't want to register our image elements, so let's 
    // override the default registry lookup to fetch the image 
    // from the event instead
    getDragData : function(e){
        e = Ext.EventObject.setEvent(e);
        var target = e.getTarget('.thumbnail');

        if(target){
            var view = this.view;
            if(!view.isSelected(target)){
                view.select(target, e.ctrlKey);
            }
            var selNodes = view.getSelectedNodes();
            var dragData = {
                nodes: selNodes
            };
            //console.log('dragData1', dragData);
            if(selNodes.length == 1){
                dragData.ddel = target.firstChild.nextSibling; // the img element
                dragData.single = true;
            }
            //console.log('dragData2', dragData);            
			//console.log('ne inna',dragData);
            return dragData;
        }
        //console.log('Inna');
        return false;
    },
    
    // this method is called by the TreeDropZone after a node drop 
    // to get the new tree node (there are also other way, but this is easiest)
    getTreeNode : function(){
        var treeNodes = [];
        var nodeData = this.view.getNodeData(this.dragData.nodes);
        for(var i = 0, len = nodeData.length; i < len; i++){
            var data = nodeData[i];
            treeNodes.push(new Ext.tree.TreeNode({
                text: data.name,
                icon: data.url,
                data: data,
                leaf:true,
                cls: 'image-node',
                qtip: data.qtip
            }));
        }
        return treeNodes;
    },
    
    // the default action is to "highlight" after a bad drop
    // but since an image can't be highlighted, let's frame it 
    afterRepair:function(){
        for(var i = 0, len = this.dragData.nodes.length; i < len; i++){
            Ext.fly(this.dragData.nodes[i]).frame('#8db2e3', 1);
        }
        this.dragging = false;    
    },
    
    // override the default repairXY with one offset for the margins and padding
    getRepairXY : function(e){
        if(!this.dragData.multi){
            var xy = Ext.Element.fly(this.dragData.ddel).getXY();
            xy[0]+=3;xy[1]+=3;
            return xy;
        }
        return false;
    }
});




Mage.Medialibrary = function () {   
    return { 
        settings : {}, 
        tree : null,
        left_panel : null,
        saveSetUrl : Mage.url + "media/move",
        getFoldersUrl : Mage.url + 'media/folderstree',
        getFolderFilesUrl : Mage.url + 'media/filesgrid',
        addDirUrl : Mage.url + 'media/mkdir',
        delDirUrl : Mage.url + 'media/rm',
        dialog : null,        
        detailsTemplate : new Ext.Template(
                '<div class="details">' +
                '   <img src="{url}">' +
                '   <div class="details-info">' +
                '       <strong>Image Name:</strong>' +
                '       <span>{text}</span>' +
                '       <strong>Size:</strong>' +
                '       <span>{sizeString}</span>' +
                '       <strong>Last Modified:</strong>' +
                '       <span>{dateString}</span>' +
                '   </div>' +
                '</div>'
            	),
        dashboard : null,
        
        /**
         * global dialog initialization
         */
        init : function (config) {
        	if (!this.dialog) {
	            this.dialog = new Ext.LayoutDialog(Ext.DomHelper.append(document.body, {tag:'div'}, true), {
	                    title: "Mediabrowser",
	                    modal: false,
	                    width:800,
	                    height:450,
	                    shadow:true,
	                    minWidth:500,
	                    minHeight:350,
	                    autoTabs:true,
	                    proxyDrag:true,

	                    west: {
	                        split:true,
	                        initialSize: 200,
	                        minSize: 150,
	                        maxSize: 250,
	                        titlebar: true,
	                        collapsible: true,
	                        animate: true,
	                        autoScroll: false,
	                        fitToFrame:true
	                    },                      
	                    center: {
	                        autoScroll:true                   
	                    },
	                    east: {
	                        split:true,
	                        initialSize: 150,
	                        minSize: 100,
	                        maxSize: 250,
	                        titlebar: true,
	                        collapsible: true,
	                        animate: true
	                    }
	            });
	            this.dialog.addKeyListener(27, this.dialog.hide, this.dialog);
	            this.dialog.setDefaultButton(this.dialog.addButton("Close", this.dialog.hide, this.dialog));
	            
	            var layout = this.dialog.getLayout();
	                
	            var cview = layout.getRegion('west').getEl().createChild({tag :'div', id:Ext.id()});
	            var tb = new Ext.Toolbar(cview.createChild());
	            tb.add({
	                id:'add',
	                text:'Add',
	                handler: function () { this.addNode(); }.createDelegate(this),
	                tooltip:'Add a new folder into the tree'
	            },'-',{
	                id:'remove',
	                text:'Remove',
	                disabled:false,
	                handler: function () { this.deleteNode(); }.createDelegate(this),
	                tooltip:'Remove the selected folder'
	            });
	            
	            
	            layout.beginUpdate();
	            this.left_panel = layout.add('west', new Ext.ContentPanel(cview, {
	                toolbar: tb
	            }));
	            
	            this.right_panel = layout.add('east', new Ext.ContentPanel(Ext.id(), {
	                title: 'Detailed Info',
	                autoCreate : true
	            }));
	            
	            var innerLayout = new Ext.BorderLayout(Ext.DomHelper.append(document.body, {tag:'div'}), {
	                alwaysShowTabs: false,
	                south: {
	                    split:true,
	                    initialSize: 150,
	                    minSize: 100,
	                    maxSize: 300,
	                    autoScroll:true,
	                    collapsible:true,
	                    titlebar: true,
	                    alwaysShowTabs: false
	                },
	                center: {                   
	                    autoScroll:true,
	                    tabPosition: 'top',
	                    alwaysShowTabs: false
	                }                
	            });
	            this.dashPanel = innerLayout.add('south', new Ext.ContentPanel(Ext.id(), {
	            	title:"Upload file",
	           		fitToFrame:true, 
					autoScroll : false,
					autoCreate:true
				}));
	            
	            var lview = innerLayout.getRegion('center').getEl().createChild({tag :'div', id:Ext.id()});
	            var ctb = new Ext.Toolbar(lview.createChild());
	            this.sortSelect = Ext.DomHelper.append(this.dialog.body.dom, {
	                tag:'select', children: [
	                    {tag: 'option', value:'text', selected: 'true', html:'Name'},
	                    {tag: 'option', value:'size', html:'File Size'},
	                    {tag: 'option', value:'mod_date', html:'Last Modified'}
	                ]
	            }, true);
	            this.sortSelect.on('change', this.sortImages , this, true);
	            
	            this.txtFilter = Ext.DomHelper.append(this.dialog.body.dom, {
	                tag:'input', type:'text', size:'12'}, true);
	                
	            this.txtFilter.on('focus', function(){this.dom.select();});
	            this.txtFilter.on('keyup', this.filter, this, {buffer:500});
	            
	            ctb.add('Filter:', this.txtFilter.dom, 'separator', 'Sort By:', this.sortSelect.dom);
	            ctb.add('-',{
	                id:'del_item',
	                text:'Delete',
	                handler: function () { this.deleteItem(); }.createDelegate(this),
	                tooltip:'Remove the selected item'
	            });
	            this.center_panel = innerLayout.add('center', new Ext.ContentPanel(lview, {             
	                toolbar: ctb
	            }));
	            
	            layout.add('center', new Ext.NestedLayoutPanel(innerLayout));
	
	            this.buildView(this.center_panel);
	            this.loadSettings();
	            
	            layout.endUpdate();    
        	}                 
            
            this.dialog.show(config ? config.btn.getEl() : {});
        },
        
        /**
         * deletes object from the folder
         */
        deleteItem : function () {          
            var selNode = this.view.getSelectedNodes()[0];
            
            var requestParams = {
                node: this.tree.getSelectionModel().getSelectedNode().attributes.id + this.settings.folderSeparator + selNode.title
            };

            var conn = new Ext.data.Connection();                    
            conn.on('requestcomplete', function(conn, response, options) {              
                var result = Ext.decode(response.responseText);

                if (result.error !== 0) {
                    Ext.MessageBox.alert('Error', result.error_message);
                }
           }.createDelegate(this));
           
           if (this.view.store.getCount() > 0) {
	           this.view.select(0);
           }
           selNode.parentNode.removeChild(selNode);                    
                    
           conn.on('requestexception', function() {
               Ext.MessageBox.alert('Error', 'requestException');
           });
            
           conn.request( {
               url: this.delDirUrl,
               method: "POST",
               params: requestParams
           });
        },
        
        /**
         * shows detailed information about selected object
         */
        showDetails : function(view, nodes){        	
        	var selNode = nodes[0];
            if (selNode && this.view.store.getCount() > 0){
                var data = this.lookup[selNode.id];             
                this.right_panel.getEl().hide();
                this.detailsTemplate.overwrite(this.right_panel.getEl(), data);
                this.right_panel.getEl().slideIn('l', {stopFx:true, duration:.2});               
            } else {
                this.right_panel.getEl().update('');
            }
        },
        
        /**
         * deletes tree node (folder)
         */
        deleteNode : function () {
            var selNode = this.tree.getSelectionModel().getSelectedNode();

            var requestParams = {
                node: selNode.attributes.id
            };
            var conn = new Ext.data.Connection();                    
            conn.on('requestcomplete', function(conn, response, options) {              
                var result = Ext.decode(response.responseText);

                if (result.error !== 0) {
                    Ext.MessageBox.alert('Error', result.error_message);
                }
           }.createDelegate(this));
           /**
            * @todo поправить что б отлавливало ивент
            */
            this.tree.getSelectionModel().selectPrevious();
            selNode.parentNode.removeChild(selNode);
                    
                    
            conn.on('requestexception', function() {
                Ext.MessageBox.alert('Error', 'requestException');
            });
            
            conn.request( {
                url: this.delDirUrl,
                method: "POST",
                params: requestParams
            });
        },
        
        /**
         * center view builder (zone with objects)
         */
        buildView : function (panel) {
            this.dataRecord = Ext.data.Record.create([
                {name: 'text'},
                {name: 'mod_date'},
                {name: 'size'},
                {name: 'url'}               
            ]);
    
            var dataReader = new Ext.data.JsonReader({
                root: 'data',
                successProperty: 'error'                    
            }, this.dataRecord);
        
            var store = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({url: this.storeUrl}),
                reader: dataReader
            });
            
            store.on('load', function () {
            	if (this.view.store.getCount() > 0) {
	            	this.view.select(0);
            	}
            }, this);
            
            this.view = new Ext.View(panel.getEl().createChild({tag:'div'}),
                '<div class="thumbnail" id="{text}" title="{text}">' +
                '   <img src="{url}" title="{text}" />' +
                '   <span>{text}</span>' +
                '</div>', { 
                    multiSelect: true, 
                    store: store
            });
            
            var dragZone = new ImageDragZone(this.view, {containerScroll:true,
                ddGroup: 'organizerDD'});
            
            var lookup = {};
            var formatSize = function(size){
                if (!size) return "unknown";
                size = parseInt(size);
                if(size < 1024) {
                    return size + " bytes";
                } else {
                    return (Math.round(((size*10) / 1024))/10) + " KB";
                }
            };
            this.view.prepareData = function(data){
                data.shortName = data.text;
                data.sizeString = formatSize(data.size);
                data.dateString = new Date(data.mod_date).format("m/d/Y g:i a");
                lookup[data.text] = data;
                return data;
            }.createDelegate(this);
            this.lookup = lookup;
            
            this.view.on('selectionchange', this.showDetails, this, {buffer:100});   
            
            /**
        	 * prevent miltiple selection
        	 */
            this.view.on('beforeselect', function () {
                if (this.view.getSelectionCount() > 0) {
                    return false;
                }
            } , this);
            this.view.store.proxy.getConnection().url = this.getFolderFilesUrl; 
        },
        
        /**
         * initialize module variables such as folder separation symbol and root folder for media library
         */
        loadSettings : function () {
            var requestUrl = Mage.url + 'media/loadsettings';
            var rootFolder;
            var conn = new Ext.data.Connection();
            conn.on('requestcomplete', function(conn, response, options) {
                var result = Ext.decode(response.responseText);
                
                this.settings.folderSeparator = result.directory_separator;
                this.settings.rootFolder = result.root_directory;
                
                this.buildTree(this.left_panel);
            }, this);

            conn.on('requestexception', function() {
                Ext.MessageBox.alert('Error', 'requestException');
            });
            
            conn.request( {
                url: requestUrl,
                method: "POST"                    
            });
                
        },
        
        addFlexUploader : function () {
        	/**
             * Flex uploader initialization and adding
             */
            if (!this.dashboard) {
                this.dashboard = new Mage.FlexUpload({
                    src: Mage.url+'../media/flex/reports.swf',
                    flashVars: 'baseUrl=' + Mage.url + '&languageUrl=flex/language&cssUrl=' + Mage.skin + 'flex.swf',
                    width: '100%',
                    height: '90%'
                }); 

                this.dashboard.on("load", function (e) { 
                    this.dashboard.setConfig( {
                        uploadFileField: 'upload_file',
                        cookie: document.cookie,
                        uploadUrl: Mage.url + 'media/upload?'+ document.cookie,
                        fileFilter: {name:"*.*", filter:"*.*"}
                    });                    
                }, this );
                
                this.dashboard.on('beforeupload', function (e) {
                	this.dashboard.setConfig( {
                		uploadParameters : {
                            destination_dir : this.tree.getSelectionModel().getSelectedNode().attributes.id
                        }
                    });
                }, this);
                
                this.dashboard.on("afterupload", function(e) {
                	 this.view.store.reload();
                } , this); 

                this.dashboard.apply(this.dashPanel.getEl());
            }
        },
        
        /**
         * creates and add tree object at mediabrowser
         */
        buildTree : function (panel) {
            var Tree = Ext.tree;               
               
            this.tree = new Tree.TreePanel(panel.getEl().createChild({tag:'div'}), {
                animate:true, 
                loader: new Tree.TreeLoader({dataUrl:this.getFoldersUrl}),
                enableDD:true,
                ddGroup: 'organizerDD',
                containerScroll: true
            });     
            
            this.tree.getSelectionModel().on('selectionchange', function (sm, node) {
                if (!node) return false;
                this.view.store.load({
                    params: {node : node.attributes.id}
                });                
            }, this);
            
            this.tree.on('beforemove', function (tree, node, oldParent, newParent, index) {
                var name = node.id.match(/[\/\\]([^\/\\]+)$/);
                newVal = newParent.id + this.settings.folderSeparator + name[1];
                oldVal = node.id;
                if (newVal == oldVal) return true;
                
                var requestParams = {
                    current_object:oldVal,
                    destination_object:newVal
                };
                var conn = new Ext.data.Connection();                    
                conn.on('requestcomplete', function(conn, response, options) {
                    var result =  Ext.decode(response.responseText);

                    if (result.error !== 0) {
                        node.text = oldVal;    
                        node.id = node.parentNode.id + oldVal;                     
                        Ext.MessageBox.alert('Error', result.error_message);
                    }
               });

                conn.on('requestexception', function() {
                    Ext.MessageBox.alert('Error', 'requestException');
                });
                        
                conn.request( {
                    url: this.saveSetUrl,
                    method: "POST",
                    params: requestParams
                });
            }.createDelegate(this));
            
            var root = new Tree.AsyncTreeNode({
                text: 'root',
                draggable:false,
                id: this.settings.rootFolder
            });
            this.tree.setRootNode(root);                        

            this.tree.render();
            root.expand();
            root.select(); 
            
            this.addFlexUploader();     
            
            var ge = new Ext.tree.TreeEditor(this.tree, {
                allowBlank:false,
                blankText:'New Folder',
                selectOnFocus:true
            });            
            
            ge.on('beforestartedit', function(){
                if(!ge.editNode.attributes.allowEdit){
                    return false;
                }
            }); 
            
            ge.on('complete', function(ge, newVal, oldVal) {
                if (newVal == oldVal) return true;
                
                var node = ge.editNode;
                var requestParams = {
                    current_object:node.parentNode.attributes.id + this.settings.folderSeparator + oldVal,
                    destination_object:node.parentNode.attributes.id + this.settings.folderSeparator + newVal
                };
                
                var conn = new Ext.data.Connection();                    
                conn.on('requestcomplete', function(conn, response, options) {
                    var result =  Ext.decode(response.responseText);

                    if (result.error !== 0) {                    
                        node.text = oldVal;    
                        node.id = node.parentNode.id + oldVal;                     
                        Ext.MessageBox.alert('Error', result.error_message);
                    }
               });

                conn.on('requestexception', function() {
                    Ext.MessageBox.alert('Error', 'requestException');
                });
                        
                conn.request( {
                    url: this.saveSetUrl,
                    method: "POST",
                    params: requestParams
                });
            });
        },
        
        /**
         * add new node at the tree
         */
        addNode : function () {
            var selNode = this.tree.getSelectionModel().getSelectedNode();
            var tmp = " (" + (selNode.childNodes.length + 1) + ")";

            var node_name = 'New Folder' + tmp;
            var node = new Ext.tree.TreeNode({
                text: node_name,
                iconCls:'cmp',
                cls:'cmp',
                type:'cmp',
                id: selNode.attributes.id + this.settings.folderSeparator + node_name,
                allowDelete:true,
                allowEdit:true                  
            });
            selNode.expand();
            selNode.appendChild(node);
            
            var requestParams = {
                node: selNode.attributes.id,
                new_directory: node_name
            };
            var conn = new Ext.data.Connection();                    
            conn.on('requestcomplete', function(conn, response, options) {
                var result = Ext.decode(response.responseText);
                
                if (result.error !== 0) {
                    node.parentNode.select();
                    node.parentNode.removeChild(node);
                    Ext.MessageBox.alert('Error', result.error_message);
                } 
           });

            conn.on('requestexception', function() {
                Ext.MessageBox.alert('Error', 'requestException');
            });
            
            conn.request( {
                url: this.addDirUrl,
                method: "POST",
                params: requestParams
            });
        },
        
        /**
         * sorts data at the view component
         */    
        sortImages : function(){
            var p = this.sortSelect.dom.value;
            this.view.store.sort(p, p != 'text' ? 'desc' : 'asc');
            this.view.select(0);
        },
		
		/*
		 * filter data at the view component while typing
		 */
        filter : function(){
            var filter = this.txtFilter.dom.value;
            this.view.store.filter('text', filter);
            this.view.select(0);
        }
    }
}();