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
// vim: ts=2:sw=4:nu:fdc=2:nospell
/**
  * Collapsible InfoPanel
  *
  * @class Ext.InfoPanel
  * @extends Ext.ContentPanel
  * @constructor
  * Creates new InfoPanel
  * @param {String/HTMLElement/Element} el The container element for this panel
  * @param {String/Object} config A string to set only the title or a config object
	* @cfg {String} bodyClass css class apply to body (defaults to a reasonable style applied to body)
	* @cfg {Boolean} animate false to switch animation of expand/collapse off (defaults to true)
	* @cfg {Boolean} collapsible false to disable collapsibility (defaults to true)
	* @cfg {Boolean} collapsed true to start with the collapsed body (defaults to false)
	* @cfg {String} trigger 'title' or 'button'. Click on what element expands/collapses the panel (defaults to 'button')
  * @cfg {String/HTMLElement/Element} bodyEl This element is removed from DOM and inserted as body of panel.
	* @cfg {String} icon Path for icon to display in title
	* @cfg {String} easingCollapse Easing to use for collapse animation (e.g. 'backIn')
	* @cfg {String} easingExpand Easing to use for expand animation (e.g. 'backOut')
	* @cfg {Boolean} showPin Show the pin button - makes sense only if panel is part of Accordion
  */
Ext.InfoPanel = function(el, config) {

	// {{{
	// basic setup
	// process config
	if('object' != typeof config) {
		this.title = config || '';
		config = {};
	}

	// save content supplied in config
	if(config.content) {
		var content = config.content;
		config.content = null;
	}

	// apply defaults
	Ext.applyIf(config, {
		collapsible: true
		, collapsed: false
		, animate: true
		, pinned: false
	});

	// call parent constructor
	Ext.InfoPanel.superclass.constructor.call(this, el, config);

	// shortcut of DomHelper
	var dh = Ext.DomHelper;
	// }}}
	// {{{
	// handle markup
	this.el.clean();
	if(this.el.dom.firstChild && !this.bodyEl) {
		this.title = this.el.dom.firstChild.innerHTML;
		if(this.el.dom.firstChild.nextSibling) {
			this.body = Ext.get(this.el.dom.firstChild.nextSibling);
		}
		var oldTitleEl = this.el.dom.firstChild;
		oldTitleEl = oldTitleEl.parentNode.removeChild(oldTitleEl);
		oldTitleEl = null;
	}
	else if(this.bodyEl) {
		this.body = Ext.fly(this.bodyEl).dom;
//		this.body = this.body.parentNode.removeChild(this.body);
		this.el.dom.appendChild(this.body);
		this.body = Ext.get(this.body);
	}
	// }}}
	// {{{
	// create title element
	this.titleEl = dh.insertFirst(this.el.dom, {
		tag: "div", unselectable: "on", cls: "x-unselectable x-layout-panel-hd x-layout-title-east"
		, children:[
			{tag: "span", cls: "x-unselectable x-layout-panel-hd-text", unselectable: "on", html: "&#160;"},
			{tag: "div", cls: "x-unselectable x-layout-panel-hd-tools", unselectable: "on"}
    ]}, true);
	this.titleEl.enableDisplayMode();
	this.titleTextEl = Ext.get(this.titleEl.dom.firstChild);
	this.tools = Ext.get(this.titleEl.dom.childNodes[1], true);
	// }}}
	// {{{
	// set title
	if(this.title) this.setTitle(this.title);
	// }}}
	// {{{
	// create collapse button
	if(this.showPin) {
		this.stickBtn = this.createTool(this.tools.dom, 'x-layout-stick');
		this.stickBtn.enableDisplayMode();
		this.stickBtn.on('click', function(e, target) {
			e.stopEvent();
			this.pinned = ! this.pinned;
			this.updateCollapseBtn();
			this.fireEvent('pinned', this, this.pinned);
		}, this);
		this.stickBtn.hide();	
	}
	if(this.collapsible) {
		this.collapseBtn = this.createTool(this.tools.dom, (this.collapsed ? 'x-layout-collapse-east' : 'x-layout-collapse-south'));
		this.collapseBtn.enableDisplayMode();
		if(this.trigger && ('title' == this.trigger)) {
			this.titleEl.addClass('x-window-header-text');
			this.titleEl.on("click", this.toggle, this);
		}
		else {
			this.collapseBtn.on("click", this.toggle, this);
		}
	}
	// }}}
	// {{{
	// create body if it doesn't exist yet
	if(!this.body) {
			this.body = dh.append(this.el, {
				tag: 'div'
				, cls: this.bodyClass || null
				, html: content || ''
				}, true);
	}
	this.body.enableDisplayMode();
	if(this.collapsed) {
		this.body.hide();
	}
	if(!this.bodyClass) {
		this.body.set({
			style: 'padding:3px;border-left:1px solid #A9BFD3;border-right:1px solid #A9BFD3;border-bottom:1px solid #A9BFD3;'
		});
	}
	// }}}
		// {{{
	// add events
	this.addEvents({
		/**
			* @event beforecollapse
			* Fires before collapse is taking place. Return false to cancel collapse
			* @param {InfoPanel} this
			*/
		beforecollapse: true
		/**
			* @event collapse
			* Fires after collapse
			* @param {InfoPanel} this
			*/
		, collapse: true
		/**
			* @event beforecollapse
			* Fires before expand is taking place. Return false to cancel expand
			* @param {InfoPanel} this
			*/
		, beforeexpand: true
		/**
			* @event expand
			* Fires after expand
			* @param {InfoPanel} this
			*/
		, expand: true
		/**
			* @event pinned
			* Fires when panel is pinned/unpinned
			* @param {InfoPanel} this
			* @param {Boolean} pinned true if the panel is pinned
			*/
		, pinned: true
		/**
			* @event animationcompleted
			* @Fires when animation is completed
			* @param {InfoPanel} this
			*/
		, animationcompleted: true

	});
	// }}}

};

// extend
Ext.extend(Ext.InfoPanel, Ext.ContentPanel, {

	// {{{
	/**
		* Called internally to create collapse button
		* Calls utility method of Ext.LayoutRegion createTool
		*/
	createTool : function(parentEl, className){
		return Ext.LayoutRegion.prototype.createTool(parentEl, className);
  }
	// }}}
	// {{{
	/**
		* Set title of the InfoPanel
		* @param {String} title Title to set
		*/
	, setTitle: function(title) {
		this.title = title;
		this.titleTextEl.update(title);
		if(this.icon) {
			this.titleTextEl.set({
				style: 'background-image:url(' + this.icon + ');background-repeat:no-repeat;background-position:0 50%;padding-left:20px;'
			});
		}
		return this;
	}
	// }}}
	// {{{
	/**
		* Get current title
		* @return {String} Current title
		*/
	, getTitle: function() {
		return this.title;
		return this;
	}
	// }}}
	// {{{
	/**
		* * Update the innerHTML of this element, optionally searching for and processing scripts
    * @param {String} html The new HTML
    * @param {Boolean} loadScripts (optional) true to look for and process scripts
    * @param {Function} callback For async script loading you can be noticed when the update completes
    * @return {Ext.Element} this
		*/
	, update: function(html, loadScripts, callback) {
		this.body.update(html, loadScripts, callback);
		return this;
	}
	// }}}
	// {{{
	/**
		* Expands the panel
		* @return {InfoPanel} this
		*/
	, expand: function() {
		if(!this.collapsed) {
			return this;
		}
		if(false === this.fireEvent('beforeexpand', this)) {
			return this;
		}
		this.collapsed = false;
		if(this.animate) {
				this.body.slideIn('t', {
					easing: this.easingExpand || null //'backOut'
					, scope: this
					, callback: this.updateCollapseBtn
				});
		}
		else {
			this.body.show();
			this.updateCollapseBtn();
		}
		this.fireEvent('expand', this);
		return this;
	}
	// }}}
	// {{{
	/**
		* Toggles the expanded/collapsed states
		*/
	, toggle: function() {
			if(this.collapsed) {
				this.expand();
			}
			else {
				this.collapse();
			}
	}
	// }}}
	// {{{
	/**
		* Collapses the panel
		* @return {InfoPanel} this
		*/
	, collapse: function() {

		if(this.collapsed || this.pinned) {
			return this;
		}

		if(false === this.fireEvent('beforecollapse', this)) {
				return this;
		}

		this.collapsed = true;
		if(this.animate) {
				this.body.slideOut('t', {
					easing: this.easingCollapse || null //'backIn'
					, scope: this
					, callback: this.updateCollapseBtn
				});
		}
		else {
			this.body.hide();
			this.updateCollapseBtn();
		}
		this.fireEvent('collapse', this);
		return this;
	}
	// }}}
	// {{{
	/**
		* Called internally to update class of the collapse button 
		* as part of expand and collapse methods
		*/
	, updateCollapseBtn: function() {
			
			if(this.collapsed) {
				if(this.showPin) {
//					Ext.fly(this.stickBtn.dom.firstChild).replaceClass('x-layout-stuck', 'x-layout-stick');
					this.collapseBtn.show();
					this.stickBtn.hide();
				}
				Ext.fly(this.collapseBtn.dom.firstChild).replaceClass('x-layout-collapse-south', 'x-layout-collapse-east');
			}
			
			// handle expanded state
			else {
				if(this.showPin) {
					if(this.pinned) {	
						Ext.fly(this.stickBtn.dom.firstChild).replaceClass('x-layout-stick', 'x-layout-stuck');
					}
					else {
						Ext.fly(this.stickBtn.dom.firstChild).replaceClass('x-layout-stuck', 'x-layout-stick');
					}
					this.collapseBtn.hide();
					this.stickBtn.show();
				}
				else {
					Ext.fly(this.collapseBtn.dom.firstChild).replaceClass('x-layout-collapse-east', 'x-layout-collapse-south');
				}
			}

			// fire animationcompleted event
			this.fireEvent('animationcompleted', this);
	}
	// }}}
	// {{{
	/**
		* Creates toolbar
		* @param {Array} config Configuration for Ext.Toolbar
		* @param {Boolean} bottom true to create bottom toolbar. (defaults to false = top toolbar)
		* @return {Ext.Toolbar} Ext.Toolbar object
		*/
	, createToolbar: function(config, bottom) {
			var create = {tag:'div'};
			config = config || null;
			this.body.applyStyles({padding:'0', border: '0', margin: '0'});
			if(bottom) {
				var tbEl = Ext.DomHelper.append(this.body, create);
			}
			else {
				var tbEl = Ext.DomHelper.insertFirst(this.body, create);
			}
			this.toolbar = new Ext.Toolbar(tbEl, config);
			return this.toolbar;
	}
	// }}}

  , getBodyEl : function() {
     return new Ext.Element(this.body);
  }

});

// end of file
