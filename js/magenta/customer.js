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
Mage.Customer = function(depend){
    var loaded = false;
    var Layout = null;
    var gridLayout = null;
    return {
        _layouts : new Ext.util.MixedCollection(true),
        baseLayout:null,
        customerLayout: null,
        editLayout : null,
        addressLayout : null,
        addressView : null,
        gridPanel:null,
        grid:null,
        addressLoading : null,
        addressPanel : null,
        addressViewUrl : Mage.url + 'address/gridData/',
        addressViewForm : Mage.url + 'address/form/',
        deleteAddressUrl : Mage.url + 'address/delete/',

        customerCardUrl : Mage.url + 'customer/card/',
        customerDelUrl : Mage.url + 'customer/delete/',
        customerGridDataUrl : Mage.url + 'customer/gridData/',
        customerDataRecord : null,
        deleteUrl : Mage.url + 'customer/delete/',
        formPanels : new Ext.util.MixedCollection(),
        forms2Panel : new Ext.util.MixedCollection(),
        forms : new Ext.util.MixedCollection(),
        customerCardId : null,
        customerRecord : null,
        
        tabCollections : new Ext.util.MixedCollection(),

        formsEdit : [],

        init : function() {
            var Core_Layout = Mage.Admin.getLayout();
            if (!this.baseLayout) {
                this.baseLayout = new Ext.BorderLayout( Ext.DomHelper.append(Core_Layout.getEl(), {tag:'div'}, true), {
                     center:{
                         titlebar: false,
                         autoScroll: true,
                         resizeTabs : true,
                         hideTabs : true,
                         tabPosition: 'top'
                     }
                });

                this.customerLayout =  new Ext.BorderLayout(Ext.DomHelper.append(Core_Layout.getEl(), {tag:'div'}, true), {
                    north: {
                        hideWhenEmpty : true,
                        titlebar : false,
                        split : true,
                        initialSize:21,
                        minSize:21,
                        maxSize:200,
                        autoScroll:true,
                        collapsible:false
                    },
                    center : {
                        autoScroll : false,
                        titlebar : false,
                        hideTabs:true,
                        preservPanels : true
                    },
                    south : {
                        preservePanels : true,
                        hideWhenEmpty : true,
                        split:true,
                        initialSize:300,
                        minSize:50,
                        titlebar: true,
                        autoScroll:true,
                        collapsible:true,
                        hideTabs : true
                    }
                });

                this.baseLayout.beginUpdate();
                this.baseLayout.add('center', new Ext.NestedLayoutPanel(this.customerLayout));
                this.baseLayout.endUpdate();

                Core_Layout.add('center', new Ext.NestedLayoutPanel(this.baseLayout, {title : 'Mange Customers'}));
                
                this.customerCard = new Mage.core.ItemCard({
                    region : this.customerLayout.getRegion('south'),
                    url : Mage.url + 'customer/card/id/'
                });
                
                this.customerCard.toolbarAdd(new Ext.ToolbarButton({
                    text : 'Delete Customer',
                    handler : this.onDeleteCustomer,
                    scope : this
                }));

            } else { // not loaded condition
                Mage.Admin.getLayout().getRegion('center').showPanel(this.baseLayout);
            }
        },

        viewGrid: function(){
            this.init();
            if (!this.gridPanel){
                var grid = this.initGrid();
                this.customerLayout.beginUpdate();
                this.gridPanel = this.customerLayout.add('center',new Ext.GridPanel(grid));
                this.customerLayout.endUpdate();
                this.grid.getDataSource().load({params:{start:0, limit:25}});
            }
        },

        getLayout : function(name) {
            return this._layouts.get(name);
        },

        loadMainPanel : function() {
            this.viewGrid();
        },

        initGrid: function(parentLayout){
            this.customerDataRecord = Ext.data.Record.create([
                {name: 'customer_id', mapping: 'customer_id'},
                {name: 'email', mapping: 'email'},
                {name: 'firstname', mapping: 'firstname'},
                {name: 'lastname', mapping: 'lastname'}
            ]);

            var dataReader = new Ext.data.JsonReader({
                root: 'items',
                totalProperty: 'totalRecords',
                id: 'customer_id'
            }, this.customerDataRecord);

             var dataStore = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({url: this.customerGridDataUrl}),
                reader: dataReader,
                remoteSort: true
             });

            dataStore.setDefaultSort('customer_id', 'desc');


            var colModel = new Ext.grid.ColumnModel([
                {header: "ID#", sortable: true, locked:false, dataIndex: 'customer_id'},
                {header: "Email", sortable: true, dataIndex: 'email'},
                {header: "Firstname", sortable: true, dataIndex: 'firstname'},
                {header: "Lastname", sortable: true, dataIndex: 'lastname'}
            ]);

            var rowSelector = new Ext.grid.RowSelectionModel({singleSelect : true});
            var grid = new Ext.grid.Grid(this.customerLayout.getEl().createChild({tag: 'div'}), {
                ds: dataStore,
                cm: colModel,
                autoSizeColumns : true,
                monitorWindowResize : true,
                autoHeight : true,
                loadMask: true,
                selModel : rowSelector,
                enableColLock : false
            });
            
            grid.getSelectionModel().on('rowselect', this.loadCustomer, this);

            this.grid = grid;

            this.grid.render();

            var gridHead = this.grid.getView().getHeaderPanel(true);
            var gridFoot = this.grid.getView().getFooterPanel(true);

            var paging = new Ext.PagingToolbar(gridHead, this.grid.getDataSource(), {
                pageSize: 25,
                displayInfo: true,
                displayMsg: 'Displaying customers {0} - {1} of {2}',
                emptyMsg: 'No customers to display'
            });

            paging.add('-', {
                text : 'Create New',
                cls : 'x-btn-text-icon btn-add-user',
                handler : this.createCustomer,
                scope : this
            });
            return grid;
        },
    
        loadCustomer : function(sm, rowIndex, record) {
            this.customerCard.loadRecord(record);
        },
        
        createCustomer : function(btn, event) {
            this.wizard = new Mage.Wizard(Ext.DomHelper.append(document.body, {tag : 'div'}, true), {
                title : 'Create New Customer',
                points : [{
                    url : Mage.url + 'customer/wizard/'
                }]
            });    
            
            this.wizard.on('finish', this.onWizardFinish, this);
            this.wizard.show(btn.getEl());
        },
        
        onDeleteCustomer : function() {
            Ext.MessageBox.confirm('Delete Customer', 'Are you sure ?!', function(btn){
                if (btn == 'yes') {
                    var delConn = new Ext.data.Connection();
                    delConn.on('requestcomplete', function(tranId, response, options) {
                        var result = Ext.decode(response.responseText);
                        if (result.error == 0) {
                            this.customerCard.closePanel();
                            this.grid.getDataSource().remove(this.customerCard.lastRecord);
                            Ext.MessageBox.alert('Delete Customer', 'Customer successfully deleted');
                        } else {
                            Ext.MessageBox.alert('Delete Customer', result.errorMessage);
                        }
                    }, this)

                    delConn.on('requestexception', function(tranId, response, options) {
                        Ext.MessageBox.alert('Delete Customer', result.errorMessage);
                    }, this)

                    delConn.request({
                        url : this.customerDelUrl,
                        method : 'POST',
                        params : {id : this.customerCard.lastRecord.data.customer_id}
                    })
                }
            }, this)
        },
        
        onWizardFinish : function(data) {
            var res = this.grid.getDataSource().add(new this.customerDataRecord({
                customer_id : data.customer_id,
                email : data.email,
                firstname : data.firstname,
                lastname : data.lastname
            }), data.customer_id);    
        }
    }
}();
