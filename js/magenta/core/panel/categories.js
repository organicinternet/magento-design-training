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
Mage.core.PanelCategories = function(region, config) {
    this.region = region;
    this.config = config;
    this.notLoaded = true;
    this.saveVar = null;
    this.tbItems = new Ext.util.MixedCollection();

    Ext.apply(this, config);
    
    this.panel = this.region.add(new Ext.ContentPanel(Ext.id(), {
        autoCreate : true,
        background : config.background || true,
       	autoScroll : true,
       	fitToFrame : true,
        title : this.title || 'Title'
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

Ext.extend(Mage.core.PanelCategories, Mage.core.Panel, {
    
    update : function(config) {
        Ext.apply(this, config);
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
        var data = {};
        var categs = [];
        this.view.store.each(function(){
            categs.push(this.data.category_id);
        })
        
        if (categs.length > 0) {
            data[this.saveVar] = categs;
        } else {
            data[this.saveVar] = '';
        }
        return data;
    },
    
    _loadActions : function() {
        if (this.toolbar) {
            if (this.tbItems.getCount() == 0) {
                this.tbItems.add('categories_sep', new Ext.Toolbar.Separator());
                this.tbItems.add('categories_remove', new Ext.Toolbar.Button({
                    text : 'Remove Category',
                    handler : this._onDeleteItem,
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
    
     _onDeleteItem : function(button, event) {
         var record = this.view.store.getAt(this.view.selections[0].nodeIndex);
         this.view.store.remove(record);
     },
    
    _unLoadActions : function() {
        this.tbItems.each(function(item){
            item.hide();
        }.createDelegate(this));
    },    
    
    _build : function() {
        this.containerEl = this._buildTemplate();
        var viewContainer = this.containerEl.createChild({tag : 'div', cls:'x-productimages-view'});
        this._buildView(viewContainer);  
    },
    
    _buildView : function(viewContainer) {
        
        this.dataRecord = Ext.data.Record.create([
            {name: 'category_id'},
            {name: 'path'},
            {name: 'image_src'},
            {name: 'image_alt'},
            {name: 'name'}
        ]);

        var dataReader = new Ext.data.JsonReader({
            root: 'items',
            totalProperty: 'totalRecords',
            id : 'category_id'
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
        
        var viewTpl = new Ext.Template('<div class="thumb-wrap">' +
                '<div id="{id}" class="thumb"><img src="{image_src}" alt="{image_alt}"></div>' +
                '<span>{name}</span>' +
                '</div>');
        viewTpl.compile();        
        this.view = new Ext.View(viewContainer, viewTpl,{
            singleSelect: true,
            store: store,
            emptyText : 'Categories not set'
        });
        
        this.view.on('beforeselect', function(view){
            return view.store.getCount() > 0;
        });
        this.view.on('selectionchange', function(view, selections){
            if (this.tbItems.get('categories_remove')) {
                if (selections.length) {
                    this.tbItems.get('categories_remove').enable();
                } else {
                    this.tbItems.get('categories_remove').disable();
                }
            }
        }.createDelegate(this));
        
        
        var dd = new Ext.dd.DragDrop(this.view.getEl(), "TreeDD");

        this.dropzone = new Ext.dd.DropTarget(this.view.getEl(), {
            overClass : 'm-view-overdrop'
        });
        
        this.dropzone.notifyOver = function(dd, e, data){
            if (this.view.store.getById(data.node.id)) {
                return this.dropzone.dropNotAllowed;
            } else {
                return this.dropzone.dropAllowed;
            }
        }.createDelegate(this);
        
        this.dropzone.notifyDrop = function(dd, e, data){
            if (this.view.store.getById(data.node.id)) {
                return false;
            };
            
            var text = '';
            data.node.bubble(function(){
                if (this.isRoot || this.attributes.isRoot) {
                    return true;
                }
                if (text != '') {
                    text = this.text + '<br>' + text;    
                } else {
                    text = this.text    
                }
            });
            
            this.view.store.add(new this.dataRecord({
                category_id : data.node.id,
                name : text
            }, data.node.id));

            this.view.select(0);
            
            if(this.dropzone.overClass){
                this.dropzone.el.removeClass(this.dropzone.overClass);
            }            
            return true;
        }.createDelegate(this);
        
        store.load();
        this.notLoaded = false;        
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
