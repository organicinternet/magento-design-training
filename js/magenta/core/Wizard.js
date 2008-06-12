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
Mage.Wizard = function(el, config) {
    this.dialog = null;
    this.currentPanel = null;  
    this.saveData = null;  
    this.points = new Ext.util.MixedCollection();
    Ext.apply(this, config);
    this.config = config || {};
    this.config.resize = false;
    
    
    Mage.Wizard.superclass.constructor.call(this, el, {
        modal: true,
        width:600,
        height:450,
        shadow:true,
        autoTabs:true,
        proxyDrag:true,
        title : this.config.title || 'Loading...',
        center:{
            tabPosition: "top",
            alwaysShowTabs: true,
            hideTabs : true
        }                
    });
    
    this.addEvents({
        cancel : true,
        finish : true
    });
    
    this.on('beforehide', this.onBeforeHide, this);
    
    this.btnHelp = this.addButton({
        text:'Help',
        align : 'left',
        handler : this.help,
        scope : this
    });
    
    this.btnBack = this.addButton({
        text : 'Back',
        align : 'center',
        handler : this.back,
        scope : this
    });
    
    this.btnNext = this.addButton({ 
        text : 'Next',
        align : 'center',
        handler : this.next,
        scope : this
    });
    
    this.btnFinish = this.addButton({ 
        text : 'Finish',
        disabled : true,
        align : 'right',        
        handler : this.finish,
        scope : this
    });
    
    this.btnCancel = this.addButton({
        text : 'Cancel',
        align : 'right',
        handler : this.cancel,
        scope : this
    });
    
    this.stepCollection = new Ext.util.MixedCollection();
}

Ext.extend(Mage.Wizard, Ext.LayoutDialog, {
    
    show : function(el) {
        Mage.Wizard.superclass.show.call(this, el);
        this.next();
    },
    
    addButton : function(config, handler, scope){
        var dh = Ext.DomHelper;
        if(!this.footer){
            this.footer = dh.append(this.bwrap, {tag: "div", cls:"x-dlg-ft"}, true);
        }
        if(!this.btnContainerLeft){
            var tb = this.footer.createChild({
                cls:"x-dlg-btns",
                html:'<table cellspacing="0" width="100%"><tbody><tr>' +
                        '<td style="text-align: left" width="33%">' +
                        '<table cellspacing="0" align="left"><tbody><tr></tr></tbody></table>' +
                        '</td>' +
                        '<td style="text-align: cetner"  width="34%">' +
                        '<table cellspacing="0" align="center"><tbody><tr></tr></tbody></table>' +
                        '</td>' +
                        '<td style="text-align: right" width="33%">' +
                        '<table cellspacing="0" align="right"><tbody><tr></tr></tbody></table>' +
                        '</td>' +
                        '</tr></tbody></table>'
            }, null, true);
            this.btnContainerLeft = tb.firstChild.firstChild.firstChild.childNodes[0].firstChild.firstChild.firstChild;
            this.btnContainerCenter = tb.firstChild.firstChild.firstChild.childNodes[1].firstChild.firstChild.firstChild;
            this.btnContainerRight = tb.firstChild.firstChild.firstChild.childNodes[2].firstChild.firstChild.firstChild;
        }
        
        var bconfig = {
            handler: handler,
            scope: scope,
            minWidth: this.minButtonWidth,
            hideParent:true
        };
        if(typeof config == "string"){
            bconfig.text = config;
        }else{
            if(config.tag){
                bconfig.dhconfig = config;
            }else{
                Ext.apply(bconfig, config);
            }
        }
        
        switch (bconfig.align) {
            case 'left':
                var btn = new Ext.Button(
                    this.btnContainerLeft.appendChild(document.createElement("td")),
                    bconfig
                );
            break;
            case 'center' :
                var btn = new Ext.Button(
                    this.btnContainerCenter.appendChild(document.createElement("td")),
                    bconfig
                );
            break;
            case 'right' :
                var btn = new Ext.Button(
                    this.btnContainerRight.appendChild(document.createElement("td")),
                    bconfig
                );
            break;
            default : 
                var btn = new Ext.Button(
                    this.btnContainerRight.appendChild(document.createElement("td")),
                    bconfig
                );
            break;    
        }
        this.syncBodyHeight();
        if(!this.buttons){
            this.buttons = [];
        }
        this.buttons.push(btn);
        return btn;
    },    
    
    help : function() {
        
    },
    
    next : function() {
        var index, panel, conn, form, data = null;        
        index = this.stepCollection.indexOf(this.currentPanel);
        
        if (index >= this.points.length - 1) {
            return false;
        }
        
        if (this.currentPanel) {
            form = this.currentPanel.getForm();
            if (form) {
                if (!form.isValid()) {
                    return false;
                }
            }        
        }         
        conn = new Ext.data.Connection();
        
        conn.on('requestcomplete', function(tranId, response, options){
            var result = Ext.decode(response.responseText);
            if (result.error == 0) {
                if (result.title != '') {
                    this.setTitle(result.title);
                }
                if (this.stepCollection.indexOf(this.currentPanel) + 1 < this.stepCollection.getCount()) {
                    this.currentPanel = this.stepCollection.get(this.stepCollection.indexOf(this.currentPanel) + 1);
                    this.currentPanel.update(result.tabs[0]);
                    this.currentPanel.show();
                } else {
                    this.currentPanel = new Mage.core.Panel(this.layout.getRegion('center'), result.tabs[0].type, result.tabs[0]);
                    this.stepCollection.add(this.currentPanel);
                }
                if (this.config.resize) {
                    this.setContentSize(Ext.get(this.currentPanel.getPanel().getEl().dom.firstChild).getWidth(), Ext.get(this.currentPanel.getPanel().getEl().dom.firstChild).getHeight() + 1);
                }
                index = this.stepCollection.indexOf(this.currentPanel);
                if (result.nextPoint && result.nextPoint.url) {
                    this.config.points[index+1] = result.nextPoint;
                }
                if (result.saveUrl) {
                    this.config.saveUrl = result.saveUrl;
                }
                if (result.btnFinish) {
                    this.btnFinish.enable();
                }
                this.checkButtons(index);        
            } else {
                Ext.MessageBox.alert('Wizard panel error', result.errorMessage);
            }
        }, this);
        
        
        this.saveData = {};
        
        this.stepCollection.each(function(panel) {
            Ext.apply(this.saveData, panel.save());
        }, this);
        
        conn.request({
            url : this.points[index+1].url,
            method : 'POST',
            params : this.saveData
        })
    },

    back : function() {
        var panel, index;
        index = this.stepCollection.indexOf(this.currentPanel) || 0;
        if (this.stepCollection.get(index-1)) {
            this.currentPanel = this.stepCollection.get(index-1);
            if (this.config.resize) {
                this.setContentSize(Ext.get(this.currentPanel.getPanel().getEl().dom.firstChild).getWidth(), Ext.get(this.currentPanel.getPanel().getEl().dom.firstChild).getHeight() + 1);
            }
            this.currentPanel.show();
        }
        this.checkButtons(index-1);
    },
    
    finish : function() {
        this.saveData = {};
        
        this.stepCollection.each(function(panel) {
            Ext.apply(this.saveData, panel.save());
        }, this);
        
        var saveConn = new Ext.data.Connection();
        
        saveConn.on('requestcomplete', function(tranId, response, options) {
            var result = Ext.decode(response.responseText);
            if (result.error == 0) {
                //console.log(result);
                this.fireEvent('finish', result.data);
                this.hide();
            } else {
                Ext.MessageBox.alert('XHR Error', result.errorMessage);
            }
        }.createDelegate(this));
        
        if (this.config.saveUrl) {
            saveConn.request({
               url : this.config.saveUrl,
               params : this.saveData,
               method : 'POST'
            });
        } else {
            Ext.MessageBox.alert('Wizard', 'Save url is not set');
        }
    },
    
    onBeforeHide : function(arguments) {
        this.fireEvent('cancel', arguments);
    },
    
    cancel : function() {
        this.hide();
    },
    
    checkButtons : function(index) {
        if (!this.points[index+1]) {
            this.btnNext.disable();
        } else {
            this.btnNext.enable();
        }

        if (index != 0) {
            this.btnBack.enable();
        } else {
            this.btnBack.disable();
        }
    }
    
    
});