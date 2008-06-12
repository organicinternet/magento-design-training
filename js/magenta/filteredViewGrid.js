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
FilteredGridView = function(){
	FilteredGridView.superclass.constructor.apply(this, arguments);
};
Ext.extend(FilteredGridView, Ext.grid.GridView, {
	render: function(){
		FilteredGridView.superclass.render.apply(this, arguments);
		
		this.filterMenu = new Ext.menu.Menu();
		this.sep = this.hmenu.add("separator");
		this.mi  = this.hmenu.add(new Ext.menu.CheckItem({id:"filters", text: "Filter", menu: this.filterMenu}));
		this.mi.on('checkchange', this.updateFilterStatus, this);
		
		this.delayedUpdate = new Ext.util.DelayedTask(this.updateFilters, this);
	},
	
	handleHdCtx: function(grid, index){
		FilteredGridView.superclass.handleHdCtx.apply(this, arguments);

		var filter = this.cm.config[index].filter;
		if(typeof filter == "string"){
			filter = this.cm.config[index].filter = new DefaultFilters[filter];
			filter.fgv = this;
		}
		this.activeFilter = filter;
		
		if(filter != null){
			this.mi.setChecked(filter.enabled, true);
			this.filterMenu.removeAll();	
			filter.installMenu(this.mi);
			
			this.mi.show();
			this.sep.show();
		} else {
			this.mi.hide();
			this.sep.hide();
		}
		
		this.hmenu.el.show();
	},
		
	updateFilters: function(){
		var filters = [];
		var i;
		for (i=0; i < this.cm.config.length; i++) {
            column = this.cm.config[i];
			var f = column.filter;
			if(f && f.enabled) {
				filters.push(column.dataIndex + ":" + f.serialize());
			};
		}
		var ds = this.grid.dataSource;
		ds.baseParams['filters'] = filters.join(";");
		ds.reload();
	},
	
	updateFilterStatus: function(item, enabled){
		this.activeFilter.enabled = enabled;
		this.delayedUpdate.delay(500);
	}
});

ColumnFilter = function(){};
ColumnFilter.prototype = {
	enabled: false,
	serialize: function(){
		return 'like:' + encodeURIComponent(this.value);
	},
	installMenu: function(rootMenu){}
}

DefaultFilters = {};
DefaultFilters['string'] = function(){};
Ext.extend(DefaultFilters['string'], ColumnFilter,{
	value: "",
	installMenu: function(rootItem){
		var rootMenu = rootItem.menu;
		
		var menu = new EditableMenuItem(this.value, {icon: 'skins/default/img/icons/find.png'});
		menu.on('keyup', function(){
			this.value = menu.getValue();
			rootItem.setChecked(true);
			this.fgv.updateFilterStatus(null, true);
		}.createDelegate(this));
		rootMenu.add(menu);
	}
});
DefaultFilters['boolean'] = function(){};
Ext.extend(DefaultFilters['boolean'], ColumnFilter, {
	value: false,
	installMenu: function(rootItem){
		var rootMenu = rootItem.menu;
		
		var optionItems = [
			new Ext.menu.CheckItem({text: "Yes", group: 'boolean'}),
			new Ext.menu.CheckItem({text: "No", group: 'boolean', checked: true})];
		
		rootMenu.add(optionItems[0]);
		rootMenu.add(optionItems[1]);
		optionItems[0].setChecked(this.value, true);
		
		var f = function(){
				this.value = optionItems[0].checked;
				this.fgv.updateFilterStatus(null, true);
				rootItem.setChecked(true);
			}.createDelegate(this);
			
		for(var i=0; i<optionItems.length; i++){
			optionItems[i].on('click', f);
			optionItems[i].on('checkchange', f);
		}
	},
	serialize: function(){
		return 'eq:' + (this.value ? '1' : '0');
	}
});
DefaultFilters['null'] = function(){};
Ext.extend(DefaultFilters['null'], DefaultFilters['boolean'], {
	serialize: function(){
		return 'null:' + (this.value ? 'notnull' : 'null');
	}
});

DefaultFilters['date'] = function(){};
Ext.extend(DefaultFilters['date'], ColumnFilter, {
	installMenu: function(rootItem){
		var rootMenu = rootItem.menu;
		
		var dates = [
			new Ext.menu.CheckItem({text: "Before", menu: new Ext.menu.DateMenu()}),
			new Ext.menu.CheckItem({text: "After", menu: new Ext.menu.DateMenu()}),
			new Ext.menu.CheckItem({text: "On", menu: new Ext.menu.DateMenu()})
		];
		
		var keys = ['before', 'after', 'onDate'];
		for(var i=0; i<keys.length; i++)
			if(this[keys[i]]){
				dates[i].menu.picker.setValue(this[keys[i]]);
				dates[i].setChecked(true, true);
			}
		
		rootMenu.add(dates[1]);
		rootMenu.add(dates[0]);
		rootMenu.add("separator");
		rootMenu.add(dates[2]);
		
		for(var i=0; i<dates.length; i++){
			dates[i].menu.on('select', function(index){
				dates[index].setChecked(true);
				this.fgv.updateFilterStatus(null, true);
				rootItem.setChecked(true);
	
				this[keys[index]] = arguments[2];
				
				if(index == 2){
					dates[0].setChecked(false, true);
					dates[1].setChecked(false, true);
					delete this.before;
					delete this.after;
				} else {
					dates[2].setChecked(false, true);
					delete this.onDate;
				}
			}.createDelegate(this, i));
			
			dates[i].on('checkchange', function(index){
				delete this[keys[index]]
				if(!this[0] && !this[1] && !this[2])
					rootItem.setChecked(false);
			}.createDelegate(this, i));
		};
	},
	serialize: function(){
		var args = [];
		if(this.before)
			args = ['dlt:' + this.convertDate(this.before)];
		if(this.after)
			args.push('dgt:' + this.convertDate(this.after));
		if(this.onDate)
			args = ['deq:' + this.convertDate(this.onDate)];
		
		return args.join(':');
	},
	convertDate: function(date){
		date = new Date(date);
		return date.format('Y-m-d');
	}
});
DefaultFilters['numeric'] = function(){};
Ext.extend(DefaultFilters['numeric'], ColumnFilter, {
	installMenu: function(rootItem){
		var rootMenu = rootItem.menu;
		
		var keys = ['gt', 'lt', 'eq'];
		var fields = [
			new EditableMenuItem(this.gt || "", {icon: 'skins/default/img/icons/greater_then.png'}),
			new EditableMenuItem(this.lt || "", {icon: 'skins/default/img/icons/less_then.png'}),
			new EditableMenuItem(this.eq || "", {icon: 'skins/default/img/icons/equals.png'})
		];

		rootMenu.add(fields[0]);
		rootMenu.add(fields[1]);
		rootMenu.add("separator");
		rootMenu.add(fields[2]);
		
		for(var i=0; i<fields.length; i++)
			fields[i].on('keyup', function(index, e, input){
				if(input.value.length > 0 && isFinite(input.value))
					this[keys[index]] = input.value;
				else
					delete this[keys[index]];
				
				rootItem.setChecked(false, true);
				for(var j=0; j<keys.length; j++)
					if(this[keys[j]]) rootItem.setChecked(true, true);

				this.fgv.updateFilterStatus(null, true);
			}.createDelegate(this, i));
	},
	serialize: function(){
		var args = [];
		if(this.lt)
			args = ['lt:' + this.lt];
		if(this.gt)
			args.push('gt:' + this.gt);
		if(this.eq)
			args = ['eq:' + this.eq];
		
		return args.join(':');
	}
});

EditableMenuItem = function(text, config){
	EditableMenuItem.superclass.constructor.call(this);
	this.text = text;
	this.config = config;
	
	Ext.apply(this.events, {keyup: true});
};
Ext.extend(EditableMenuItem, Ext.menu.BaseItem, {
    itemCls : "x-menu-item",
    hideOnClick: false,
    onRender: function(){
        var s = document.createElement("div");
        s.className = this.itemCls;
        s.style.paddingRight = "10px";
        if(Ext.isGecko)
        	s.style.overflow     = 'auto';
        s.innerHTML = '<img src="' + this.config.icon + '" class="x-menu-item-icon" /><input type="text" style="width: 120px" class="x-menu-input-box" />';
        
        this.field = s.lastChild;
        this.field.value = this.text;
        this.el = s;
        this.relayEvents(Ext.get(this.field), ["keyup"]);
        EditableMenuItem.superclass.onRender.apply(this, arguments);
    },
    getValue: function(){
    	return this.field.value;
    }
});