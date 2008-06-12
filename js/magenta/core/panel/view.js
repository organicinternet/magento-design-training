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
Mage.core.PanelView = function(region, config) {
    this.region = region;
    this.notLoaded = true;    

    Ext.apply(this, config);
    this.panel = this.region.add(new Ext.ContentPanel(Ext.id(), {
        autoCreate : true,
        url : this.url || null,
        loadOnce : true,
       	autoScroll : true,
       	fitToFrame : true,       	
        title : this.title || 'Title'
    }, this.content));
    
    this.panel.getUpdateManager().on('update', function() {
        this.notLoaded = false;
    }, this)
    

    this.panel.on('activate', function(){
        if (this.notLoaded) {
            this.panel.setContent(this.content);
            if (typeof this.url == 'string' && this.url != '') {
                this.panel.load(this.url);
            }
        }
    }, this);
};

Ext.extend(Mage.core.PanelView, Mage.core.Panel, {
    update : function(config) {
        Ext.apply(this, config);
        if (this.region.getActivePanel() == this.panel) {
            this.panel.setContent(this.content);
            if (typeof this.url == 'string' && this.url != '') {
                this.panel.load(this.url);
            }
        } else {
            this.notLoaded = true;
        }
    }
})
