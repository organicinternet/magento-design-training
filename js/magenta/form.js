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
Mage.Form = function(form){
    var that = this;
    
    this.elements = new Ext.util.MixedCollection(false);
    
    this.form = Ext.getDom(form);
    this.id = form.id;
    this.action = form.action;
    this.method = form.method;
    this.timeout = 10000;
    this.transId = null;
    this.disabled = false;
    this.scipFile = true;
    this.enctype = form.getAttribute("enctype");
    
    if(this.enctype && this.enctype.toLowerCase() == "multipart/form-data"){
        this.isUpload  = true;
    }                


    this._parseElements = function(form) {
        var i = 0;
        for(i=0; i < form.elements.length; i++) {
            this.elements.add(form.elements[i].name, form.elements[i]);
        }
    }
    
    this._parseElements(this.form);
    

    this.appendForm = function(form, force) {
        if (form.action != this.action && !force) {
            return false;
        }
        this._parseElements(form);
    }
    

    this.sendForm = function(callBack, reset) {
        if (!this.action) {
            Ext.MessageBox.alert('Form','From action do not set');
            return false;
        }
        var i = 0;
        var formData = '';
        var elm;

        for(i=0; i < this.elements.getCount(); i++) {
            elm = this.elements.itemAt(i);
            oElement = elm;
			oDisabled = elm.disabled;
			oName = elm.name;
			oValue = elm.value;

			// Do not submit fields that are disabled or
			// do not have a name attribute value.
			if(!oDisabled && oName)
			{
				switch (oElement.type)
				{
					case 'select-one':
					case 'select-multiple':
						for(var j=0; j<oElement.options.length; j++){
							if(oElement.options[j].selected){
								if(window.ActiveXObject){
									formData += encodeURIComponent(oName) + '=' + encodeURIComponent(oElement.options[j].attributes['value'].specified?oElement.options[j].value:oElement.options[j].text) + '&';
								}
								else{
									formData += encodeURIComponent(oName) + '=' + encodeURIComponent(oElement.options[j].hasAttribute('value')?oElement.options[j].value:oElement.options[j].text) + '&';
								}

							}
						}
						break;
					case 'radio':
					case 'checkbox':
						if(oElement.checked){
							formData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
						}
						break;
					case 'file':
						// stub case as XMLHttpRequest will only send the file path as a string.
					case undefined:
						// stub case for fieldset element which returns undefined.
					case 'reset':
						// stub case for input type reset button.
					case 'button':
						// stub case for input type button elements.
						break;
					case 'submit':
						if(hasSubmit == false){
							formData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
							hasSubmit = true;
						}
						break;
					default:
						formData += encodeURIComponent(oName) + '=' + encodeURIComponent(oValue) + '&';
						break;
				}
			}            
        }

   		formData = formData.substr(0, formData.length - 1);
        

        var cb = {
            success : this.successDelegate,
            failure : this.failureDelegate,
            timeout : this.timeout,
            argument: {"url": this.action, "method":this.method, "form": this.form, "reset":reset, "callBack": callBack}
        }
       // params = formData.join('&');
        this.transId = Ext.lib.Ajax.request(this.method, this.action, cb, formData);
    }
    
    this.processSuccess = function(response) {
        if (typeof response.argument.callBack == 'function') {
            response.argument.callBack(response, {success:true});
        }
    }
    
    this.processFailure = function(response) {
        if (typeof response.argument.callBack == 'function') {
            response.argument.callBack(response, {success:false});
        }
    }
    
    this.disable = function () {
      var i = 0;
      for(i=0; i < this.elements.getCount(); i++) {
          var elm = this.elements.itemAt(i);
          elm.disabled = true;
          this.disabled = true;
      }   
    }

    this.enable = function () {
        var i;
        for(i=0; i < this.elements.getCount(); i++) {
            var elm = this.elements.itemAt(i);
            elm.disabled = false;
            this.disabled = false;
        }
    }

    
    this.successDelegate = this.processSuccess.createDelegate(this);
    this.failureDelegate = this.processFailure.createDelegate(this);
    
};
