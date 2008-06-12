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
Mage.Search = function() {
    return {
        init : function(toolbar) {
           var ds = new Ext.data.Store({
                proxy: new Ext.data.HttpProxy({
                    url: Mage.url + 'search/do/'
                }),
                reader: new Ext.data.JsonReader({
                    root: 'items',
                    totalProperty: 'totalCount',
                    id: 'id'
                }, [
                    {name: 'type', mapping: 'type'},
                    {name: 'name', mapping: 'name'},
                    {name: 'description', mapping: 'description'}
                ])
            });

            // Custom rendering Template
            var resultTpl = new Ext.Template(
                '<div class="search-item">',
                    '<h3><span>{type}</span>{name}</h3>',
                    '{description}',
                '</div>'
            );            
            
            var comboSearch = new Ext.form.ComboBox({
                store: ds,
                displayField:'title',
                typeAhead: false,
                loadingText: 'Searching...',
                width: 250,
                pageSize:10,
                hideTrigger:true,
                tpl: resultTpl,
                onSelect: function(record){ // override default onSelect to do redirect
                    var id = record.id.split('/');
                    switch (id[0]) {
                        case 'product':
                            Mage.Catalog_Product.viewGrid({load:true, catId:id[1], catTitle:''});
                            Mage.Catalog_Product.doCreateItem(id[2], 'yes');
                            break;
                            
                        case 'customer':
                            Mage.Customer.loadMainPanel();
                            Mage.Customer.customerCardId = id[2];
                            Mage.Customer.showEditPanel();
                            break;
                            
                        case 'order':
                            Mage.Sales.loadMainPanel();
                            Mage.Sales.loadOrder({
                                id : id[2],
                                title : record.json.form_panel_title
                            })
                            break;
                    }
                }
           });
           toolbar.addField(comboSearch);
        }
    }
}();