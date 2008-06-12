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
 * @author       Magento Core Team <core@magentocommerce.com>
 * @fileoverview Form panel for ItemCard
 */

Mage.core.PanelForm = function(region, config) {
    this.region = region;
    this.config = config;
    this.notLoaded = true;
    /**
     * @param Mage.form.JsonForm
     */
    this.frm = null;
    this.tpl = null;
    /**
     * @param form config for this.frm
     */
    this.form = {};
    
    Ext.apply(this, config);
    this.form.config.id = Ext.id();
    
    var background = false;
    if (config && config.background == true) {
        background = true;
    }

    this.panel = this.region.add(new Ext.ContentPanel(Ext.id(), {
        autoCreate : true,
        background : background,
        autoScroll : true,
        fitToFrame : true,
        title : this.title || 'Title'
    }));

    if (background) {
        this.panel.on('activate', function() {
          if (this.form) {
              this._buildForm();
               this.notLoaded = false;
          }
         }, this, {single : true})
    } else {
         this._buildForm();
         this.notLoaded = false;
    }


    this.panel.on('activate', function() {
        if (this.notLoaded) {
            this._rebuildForm();
            this.notLoaded = false;
        }
    }, this)

};

Ext.extend(Mage.core.PanelForm, Mage.core.Panel, {
    
    update : function(config) {
        this.form = null;
        Ext.apply(this, config);    
        this.form.config.id = Ext.id();
        
        if (this.region.getActivePanel() == this.panel) {
            this._rebuildForm();
            this.notLoaded = false;   
        } else {
            this.notLoaded = true;   
        }

    },
    
    save : function() {
        var data, i;
        data = {};
        for (i=0; i < this.frm.items.getCount(); i++) {
            data[this.frm.items.get(i).getName()] = this.frm.items.get(i).getValue()
        }
        return data;    
    },
    

    _rebuildForm : function() {
        if (!this.form) {
            return false;
        }
        
        var i;
        
        if (this.frm) {
            for (i=0; i < this.frm.items.getCount(); i++) {
                this.frm.remove(this.frm.items[i]);
            }
            this.frm = null;
            this.panel.setContent('');
            this._buildForm();
        }
    },
    
    getForm : function() {
        return this.frm;
    },
    
    _buildTemplate : function(formId) {
        if (!this.tpl) {
            this.tpl = new Ext.Template('<div>' +
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>' +
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc">' +
                '<div id="{formElId}">' +
                '</div>' +
                '</div></div></div>' +
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>' +
                '</div>');
           this.tpl.compile();         
        }
        
        this.tpl.append(this.panel.getEl(), {formElId : formId});
    },
    
    _buildForm : function() {
        var i;
        this.frm = new Mage.form.JsonForm({
            method : this.form.config.method,
            name : this.form.config.name,
            action : this.form.config.action,
            fileUpload : this.form.config.fileupload,
            metaData : this.form.formElements
        });
        
        this._buildTemplate(this.form.config.id + '_El');        
        var res = Ext.get(this.form.config.id + '_El');
        this.frm.render(this.form.config.id + '_El');
    }
})
