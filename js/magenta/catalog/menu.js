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
Mage.Menu_Catalog = function(){
    var menu;
    return {
        init : function(toolbar){
            menu = new Ext.menu.Menu({
                id: 'mainCatalogMenu',
                items: [
                    new Ext.menu.Item({
                        text: 'Categories and Products',
                        handler : Mage.Admin.callModuleMethod.createDelegate(Mage.Admin, ['catalog', 'loadMainPanel'], 0)                        
                    }),
                    '-',
/*
                    new Ext.menu.Item({
                        text: 'Category attributes',
                        handler: Mage.Catalog_Category_Attributes.loadAttributesPanel.createDelegate(Mage.Catalog_Category_Attributes)                        
                    }),
*/
                    new Ext.menu.Item({
                        text: 'Product attributes',  
                        handler : Mage.Admin.callModuleMethod.createDelegate(Mage.Admin, ['product_attirbutes', 'loadMainPanel'], 0)                                                
                    })
/*
                    '-',
                    new Ext.menu.Item({
                        text: 'Product datafeeds'                  
                    })
*/
                 ]
            });
            
           toolbar.addButton({
                cls: 'x-btn-text bmenu',
                text:'Catalog',
                menu: menu
            });
        }
    }
}();