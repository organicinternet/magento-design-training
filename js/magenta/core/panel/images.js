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
Mage.core.PanelImages = function(region, config) {
    this.region = region;
    this.notLoaded = true;
    this.saveVar = null;    
    this.tbItems = new Ext.util.MixedCollection();
    Ext.apply(this, config);
    this.panel = this.region.add(new Ext.ContentPanel(Ext.id(), {
        autoCreate : true,
       	autoScroll : true,
       	fitToFrame : true,   
       	background : config.background || true,    	
        title : this.title || 'Images'
    }));

    this.panel.on('activate', function(){
        this._build();
    }, this, {single: true});

    this.panel.on('activate', function(){
        this._loadActions();
        if (this.notLoaded) {
            this.view.store.proxy.getConnection().url = this.storeUrl;
            this.view.store.load();
            this.notLoaded = false;
        }
    }, this);
    this.panel.on('deactivate', this._unLoadActions, this);
};

Ext.extend(Mage.core.PanelImages, Mage.core.Panel, {
    update : function(config) {
        if (this.region.getActivePanel() === this.panel) {
            this.view.store.proxy.getConnection().url = this.storeUrl;
            this.view.store.load();
            this.notLoaded = false;            
        } else {
            this.notLoaded = true;
        }
    },
    
    save : function() {
        if (!this.saveVar) {
            return false;
        }
        this.saveVar = 'test';
        var data = {};
        var items = [];
        this.view.store.each(function(){
            items.push(this.data.path);
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
                var disabled = false
                if (this.view) {
                    disabled = this.view.store.getCount() <= 0;
                }
                this.tbItems.add('image_sep', new Ext.Toolbar.Separator());
                this.tbItems.add('image_delete', new Ext.Toolbar.Button({
                    text : 'Delete Image',
                    disabled : disabled,
                    handler : this._onDeleteImage,
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
    
    _unLoadActions : function() {
        this.tbItems.each(function(item){
            item.hide();
        }.createDelegate(this));
    },
    
    
    _build : function() {
        this.containerEl = this._buildTemplate();
        var formContainer = this.containerEl.createChild({tag : 'div'});        
        var viewContainer = this.containerEl.createChild({tag : 'div', cls:'x-productimages-view'});
        
        this._buildForm(formContainer);
        this._buildImagesView(viewContainer);  
    },
    
    _buildForm : function(formContainer) {
        this.frm = new Mage.form.JsonForm({
            fileUpload : this.form.config.fileupload,
            method : this.form.config.method,
            action : this.form.config.action,
            metaData : this.form.elements,
            waitMsgTarget : formContainer
        }); 
        
        this.frm.render(formContainer);       
        
        this.frm.on({
            actionfailed : function(form, action) {
                Ext.MessageBox.alert('Error', 'Error');
            },
            actioncomplete : function(form, action) {
                this.view.store.add(new this.dataRecord(action.result.data));
                this.view.refresh();
                form.reset();
            }.createDelegate(this)
        });
     },
     
     _onDeleteImage : function(button, event) {
         var record = this.view.store.getAt(this.imagesView.selections[0].nodeIndex);
         this.view.store.remove(record);
     },
    
    _buildImagesView : function(viewContainer) {
        
        this.dataRecord = Ext.data.Record.create([
            {name: 'id'},
            {name: 'src'},
            {name: 'path'},
            {name: 'alt'},
            {name: 'description'}
        ]);

        var dataReader = new Ext.data.JsonReader({
            root: 'items',
            totalProperty: 'totalRecords'
        }, this.dataRecord);
    
    
        var store = new Ext.data.Store({
            proxy: new Ext.data.HttpProxy({url: this.storeUrl}),
            reader: dataReader
        });
        
        store.on('load', function() {
            if (this.view) {
                this.view.select(0);
            }
        }.createDelegate(this));

        this.LoadMask = new Ext.LoadMask(this.panel.getEl(), {
            store: store
        });
        
        var viewTpl = new Ext.Template('<div class="thumb-wrap" id="{name}">' +
                '<div id="{id}" class="thumb"><img src="{src}" alt="{alt}"></div>' +
                '<span>{description}</span>' +
                '</div>');
        viewTpl.compile();
                   
        this.view = new Ext.View(viewContainer, viewTpl,{
            singleSelect: true,
            store: store,
            emptyText : 'Images not found'
        });
        
        this.view.on('beforeselect', function(view){
            return view.store.getCount() > 0;
        });
        this.view.on('selectionchange', function(view, selections){
            if (this.tbItems.get('image_delete')) {
                if (selections.length) {
                    this.tbItems.get('image_delete').enable();
                } else {
                    this.tbItems.get('image_delete').disable();
                }
            }
        }.createDelegate(this));
        
        store.load();
        this.notLoaded = true;
    },
    
    _buildTemplate : function() {
        this.tpl = new Ext.Template('<div>' +
            '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>' +
            '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc">' +
            '<div id="{containerElId}">' +
            '</div>' +
            '</div></div></div>' +
            '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>' +
            '</div>');
       containerElId = Ext.id();
       var tmp = this.tpl.append(this.panel.getEl(), {containerElId : containerElId}, true);
       return Ext.get(containerElId);
    }
})
