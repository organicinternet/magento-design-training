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
Mage.Menu_Sales = function(){
    var menu;
    return {
        init : function(toolbar){
            menu = new Ext.menu.Menu({
                id: 'mainSalesMenu',
                items: [
                    new Ext.menu.Item({
                        text: 'Orders',
                        handler : Mage.Admin.callModuleMethod.createDelegate(Mage.Admin, ['sales', 'loadMainPanel'], 0)
                    }),
                    new Ext.menu.Item({
                        text: 'Price Rules',
                        handler : Mage.Admin.callModuleMethod.createDelegate(Mage.Admin, ['price_rules', 'loadMainPanel'], 0)
                    })
                 ]
            });
            toolbar.addButton({
                cls: 'x-btn-text .btn-sales',
                text:'Sales',
                menu: menu
            });
        }
    }
}();