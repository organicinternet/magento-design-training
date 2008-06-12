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
Mage.Manager = function(){
    this.modules = new Ext.util.MixedCollection(true);
    this.activeModule = 'default';
    this.stepCounter = 0;
    
    Mage.Manager.superclass.constructor.call(this);
    this.addEvents({
        load : true,
        beforeModuleRegister : true,
        afterModuleRegister : true,
        beforeCallModuleMethod : true,
        afterCallModuleMethod : true,
        changeModule : true
    })
}

Ext.extend(Mage.Manager, Ext.util.Observable, {
        layout : null,
        
        init: function(){
            
            Ext.get('loading').remove();            
            
            this._layout = new Ext.BorderLayout(document.body, {
                    hideOnLayout:true,
                    north:{
                        split:false,
                        initialSize:27,                        
                        titlebar:false,
                        collapsible:false
                    },
                    center:{
                        resizeTabs:true,
                        alwaysShowTabs:true,
                        hideTabs:true,
                        tabPosition:'top',
                        titlebar:false,
                        autoScroll:false,
                        closeOnTab:true
                    },
                    south:{
                        split:false,
                        initialSize:20,
                        titlebar:false,
                        collapsible:false,
                        animate:false
                    },
                    east:{
                        collapsedTitle : '<strong>TaskBar</strong>',
                        split:true,
                        initialSize:185,
                        autoScroll:true,
                        collapsible:true,
                        titlebar:true,
                        animate:false
                    }
                });
            this._layout.getRegion('east').getEl().addClass('my-tasks-region');
            
            this._layout.beginUpdate();
            var panel = this._layout.add('north', new Ext.ContentPanel('north', {fitToFrame: true, autoCreate : true}));
            this._initToolbar(panel.getEl());            
            
//            this._layout.add('center', new Ext.ContentPanel('dashboard-center', {title:"DashBoard", fitToFrame:true, autoCreate:true}, '<embed width="100%" height="100%" align="middle" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer" allowscriptaccess="sameDomain" name="reports" bgcolor="#869ca7" quality="high" flashvars="configUrl='+Mage.url+'mage_reports/flex/config/&cssUrl='+Mage.url+'skins/default/flex.swf" id="reports" wmode="opaque" src="'+Mage.url+'flex/reports.swf"/>'));
            this.dashboard = new Mage.FlexObject(
				{
					src: Mage.url+'../media/flex/reports.swf',
					flashVars: 'configUrl='+Mage.url+ 'flex/config&cssUrl=' + Mage.skin + 'flex.swf',
					width: '100%',
					height: '100%'
				}
			); 
			/* 
			this.dashboard = new Mage.FlexUpload(
				{
					src: Mage.url+'../media/flex/reports.swf',
					flashVars: 'baseUrl='+Mage.url + '&languageUrl=flex/language&cssUrl=' + Mage.skin + 'flex.swf',
					width: '90%',
					height: '90%'
				}
			); 
            
			this.dashboard.on( "load", function (e) { 
				this.dashboard.setConfig( {
					uploadFileField: 'filename',
					uploadUrl: Mage.url + '../test/upload/save/'
				} );
			}, this );  */
			
            
            
			/*
			this.dashboard.on( "add", function () { 
				return false;
			}, this );
			*/
			
			/*this.dashboard.on( "afterupload", function( e ) {
				 for( var i = 0; i < e.data.length; i ++)
				 {
					alert(e.data[i].name);
				 }
				 
			} , this); */
            
          /*   this.dashboard = new Mage.FlexObject(
                {
					src: Mage.url+'../media/flex/dashboard.swf',
					flashVars: 'baseUrl='+Mage.url + '&languageUrl=flex/language&cssUrl=' + Mage.skin + 'flex.swf',
                   	width: '100%',
					height: '99%'
				}
            )  */
            
			var dashPanel = this._layout.add('center', new Ext.ContentPanel('dashboard-center', {
			    title:"DashBoard", 
			    fitToFrame:true, 
			    autoScroll : false,
			    autoCreate:true
			}));
			this.dashboard.apply(dashPanel.getEl());
            // alert( this.dashboard.applyHTML() );
            			
            this.statusPanel = this._layout.add('south', new Ext.ContentPanel('south', {"autoCreate":true}));
            this.taskPanel = this._layout.add('east',new Ext.ContentPanel('east', {"title":"My Tasks","autoCreate":true}));
            
            this._layout.endUpdate();

            this.fireEvent('load', this);
            this.on('afterCallModuleMethod', this.onAfterCallModuleMethod.createDelegate(this));
            this.on('changeModule', this.onChangeModule.createDelegate(this));
        },
        
        register : function(name, obj) {
            var e = {
                name : name,
                obj : obj,
                cancel : false
            };
            this.fireEvent('beforeModuleRegister', e);
            if (e.cancel == true) {
                return false;
            }
            this.modules.add(name, obj);                
            this.fireEvent('afterModuleRegister', e);            
        },
        
        callModuleMethod : function(modName, method) {
            var module = this.modules.get(modName);
            if (module  && 'object' == typeof module && 'function' == typeof module[method]) {
                var e = {
                    modName : modName,
                    method : method,
                    cancel : false
                };
                this.fireEvent('beforeCallModuleMethod', e);
                if (e.cancel == true) {
                    return false;
                }
                module[method].call(module);
                this.fireEvent('afterCallModuleMethod', e);               
            }  
        },
        
        onAfterCallModuleMethod : function(event) {
            if (this.activeModule !=  event.modName) {
                this.activeModule = event.modName;
                this.fireEvent('changeModule', this.activeModule, event.modName);
            }
        },
        
        onChangeModule : function(oldName, newName) {
            document.title = newName;
            this.stepCounter++;
            str = document.location.href.replace(/(.*)\#(.*)$/, '$1'+'#step' + this.stepCounter);
            //document.location.href = str;

            this.statusPanel.setContent(newName);
        },
        
        _initToolbar : function(el){
            this.toolbar = new Ext.Toolbar(el);
        },
        
        getToolbar : function() {
            return this.toolbar;
        },
        
        getLayoutRegion : function(region){
            return this._layout.getRegion(region);
        },
        
        getLayout : function(){
            return this._layout;
        },
        
        updateRegion : function(region, url){
            
        },
        
        applyDbUpdates : function(){
            var success = function(o) {Ext.MessageBox.alert('Apply DB Updates',o.responseText);}
            var failure = function(o) {Ext.MessageBox.alert('Apply DB Updates',o.statusText);}
            var cb = {
                success : success,
                failure : failure,
                argument : {}
            };
            var con = new Ext.lib.Ajax.request('GET', Mage.url + '/index/applyDbUpdates', cb);
        }
});

Mage.Admin = new Mage.Manager();

Ext.EventManager.onDocumentReady(Mage.Admin.init, Mage.Admin, true);


Mage.Admin.on('load', function(admin){
    
    admin.register('customer', Mage.Customer);
    admin.register('catalog', Mage.Catalog);
    admin.register('aith', Mage.Auth);
    admin.register('sales', Mage.Sales);
    admin.register('permissions', Mage.PermissionPanel);
    admin.register('product_attirbutes', Mage.Catalog_Product_Attributes);
    
    var toolbar = admin.toolbar;
    Mage.Menu_Core.init(toolbar);    
    Mage.Menu_Customer.init(toolbar);    
    Mage.Menu_Catalog.init(toolbar);            
    Mage.Menu_Sales.init(toolbar);
        
    toolbar.addButton(new Ext.ToolbarButton({
	    text: "test media browser",
		handler: function () {
			Mage.Medialibrary.init();
		}
	}));
	
    Mage.Menu_ACL.init(toolbar);
    // create wide spacer, after this line all items will be aligned to right
    Ext.fly(toolbar.addSpacer().getEl().parentNode).setStyle('width', '100%')        
    /// !!! do not remove this item
    Mage.Search.init(toolbar);    
    Mage.Menu_Core.initRight(toolbar);     
    Mage.mod_Tasks.init(admin);
});
