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
Mage.Tasks = function() {
    Mage.Tasks.superclass.constructor.call(this);
};

Ext.extend(Mage.Tasks, Ext.util.Observable, {
    init : function(admin) {
        
        var panel1 = new Ext.InfoPanel(admin.taskPanel.getEl().createChild({tag : 'div'}), "Info panel - with default config");
        var calendarEl = panel1.getBodyEl().createChild({tag : 'div'});
        calendar = new Ext.DatePicker({});
        calendar.render(calendarEl);


        var panel2 = new Ext.InfoPanel(admin.taskPanel.getEl().createChild({tag : 'div'}), {
            collapsed: true, 
            title: 'Info panel - initially collapsed',
            content: 'Nam venenatis nonummy quam....'
        });

        var panel3 = new Ext.InfoPanel(admin.taskPanel.getEl().createChild({tag : 'div'}), {
            animate: false,
            title: 'Info panel - animation disabled',
            content: 'Ut placerat. Aenean quis erat...'
        });

        var panel4 = new Ext.InfoPanel(admin.taskPanel.getEl().createChild({tag : 'div'}), {
            collapsed: true,
            trigger: 'title',
            title: 'Info panel - title click expands',
            content: 'Donec lorem erat, ultricies eget...'
        });
    }    
});

Mage.mod_Tasks = new Mage.Tasks();