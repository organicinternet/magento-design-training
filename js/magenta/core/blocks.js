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
Mage.Core_Blocks = function(){
    var blockDialog = null;
    return {
        init: function(){
/*
            Mage.Menu_Core.add('-');
            Mage.Menu_Core.add({
                text: 'Blocks & Layouts',
                handler: Mage.Core_Blocks.showDialog.createDelegate(Mage.Catalog_Blocks)
            });
*/
        },
        showDialog: function(){
            Ext.QuickTips.init();
            if (!blockDialog) {
                blockDialog = new Ext.LayoutDialog(Ext.id(), {
                    autoCreate : true,
                    width:700,
                    height:500,
                    minWidth:600,
                    minHeight:400,
                    syncHeightBeforeShow: true,
                    shadow:true,
                    fixedcenter:true,
                    center:{autoScroll:false},
                    west:{split:true,initialSize:200,minSize:150}
                });
                blockDialog.setTitle('Blocks & Layouts');
                blockDialog.setDefaultButton(blockDialog.addButton('Cancel', blockDialog.hide, blockDialog));

                var layout = blockDialog.getLayout();
                var blocks = layout.getEl().createChild({tag:'div', id:'blocks'});
                var tb = new Ext.Toolbar(blocks.createChild({tag:'div'}));
                tb.addButton({
                    text: 'New Block'
                });
                var viewEl = blocks.createChild({tag:'div', id:'folders'});

                var treePanel = layout.add('west', new Ext.ContentPanel(blocks, {
                    title:'Blocks', 
                    fitToFrame:true,
                    autoScroll:true,
                    autoCreate:true,
                    toolbar: tb,
                    resizeEl:viewEl
                }));
                
                var tree = new Ext.tree.TreePanel(viewEl, {
                    animate:true, 
                    loader: new Ext.tree.TreeLoader({dataUrl:Mage.url+'block/blockChildren/'}),
                    enableDD:true,
                    containerScroll: true,
                    dropConfig: {appendOnly:true}
                });

                var root = new Ext.tree.AsyncTreeNode({
                    text: 'Config', 
                    draggable:false, // disable root node dragging
                    id:'config'
                });

                tree.setRootNode(root);
                tree.render();

                var centerPanel = layout.add('center', new Ext.ContentPanel(Ext.id(), {
                    autoCreate : true,
                    fitToFrame:true
                }));
            }

            blockDialog.show();
        }
    }
}();

Mage.Core_Blocks.init();