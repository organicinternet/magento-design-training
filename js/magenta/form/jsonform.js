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
Mage.form.JsonForm = function(config) {
    if (!this.id) {
        this.id = Ext.id();
    }
    Mage.form.JsonForm.superclass.constructor.call(this, config);
}

Ext.extend(Mage.form.JsonForm, Ext.form.Form, {
    render : function(ct) {
        if (this.metaData) {
            this._buildMetaData();
        }
        Mage.form.JsonForm.superclass.render.call(this, ct);
    },
    
    _buildMetaData : function() {
        for(i=0; i < this.metaData.length; i++) {
          this._makeElement(this, this.metaData[i]);
        }
    },
    
    _makeElement : function(form, element) {
        var i;
        switch(element.config.type) {
            case 'fieldset' :
                form.fieldset(element.config);
                for(i=0; i < element.formElements.length; i++) {
                    this._makeElement(form, element.formElements[i]);
                }
                form.end;
                return true;
                break;
            case 'column' :
                form.column(element.config);
                for(i=0; i < element.formElements.length; i++) {
                    this._makeElement(form, element.formElements[i]);
                }
                form.end;
                return true;
                break;                
            default :
                form.add(this._makeField(element))
                return true;
                break;                
        }
    },
    
    _makeField : function(field) {
        var ab = true;
        if (field.config.allowBlank === false) {
            ab = false;
        }
        var config = {
            fieldLabel : field.config.label,
            id : field.config.name + '_' + this.id,
            name : field.config.name,
            msgTarget : field.config.msgTarget || 'side',
            allowBlank : ab,
            vtype : field.config.vtype,
            inputType : field.config.inputtype || '',
            value : field.config.value
        };
        switch (field.config.ext_type) {
            case 'checkbox' :
                return new Ext.form.Checkbox(config);                
            case 'combobox' :
                var RecordDef = Ext.data.Record.create([{name: 'value'},{name: 'label'}]);                    
                var myReader = new Ext.data.JsonReader({root: 'values'}, RecordDef);                    
                var store = new Ext.data.Store({
                   	reader : myReader,
                   	proxy : new Ext.data.MemoryProxy(field.config)
                });
                store.load();
                config.store = store;
                config.displayField = 'label';
                config.valueField = 'value';
                config.emptyText  = field.config.emptyText;
                config.mode = 'local';
                config.typeAhead = true;
                config.triggerAction = 'all';
                config.forceSelection = true;
                var combo = new Ext.form.ComboBox(config);
                return combo;
            case 'datefield' :
                return new Ext.form.DateField(config);                
            case 'numberfield' :
                return new Ext.form.NumberField(config);                
            case 'radio' :
                return new Ext.form.Radio(config);                
            case 'textarea' :
                return new Ext.form.TextArea(config);                
            case 'textfield' :
                return new Ext.form.TextField(config);
            case 'hiddenfield' :
                return new Ext.form.TextField(config);
            case 'file' : 
            case 'imagefile' :                 
                config.form = this;
                config.autoSubmit = field.config.autoSubmit || false;
                config.value = "";
                return new Mage.form.FileField(config);
        }
        throw 'This field type:"'+field.config.ext_type+'" not supported';
    }
})

