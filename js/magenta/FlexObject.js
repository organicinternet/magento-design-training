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
Mage.FlexObject = function(config) {
	Mage.FlexObject.superclass.constructor.call(this);
	
	this.isIE  = (navigator.appVersion.indexOf("MSIE") != -1) ? true : false;
	this.isWin = (navigator.appVersion.toLowerCase().indexOf("win") != -1) ? true : false;
	this.isOpera = (navigator.userAgent.indexOf("Opera") != -1) ? true : false;
	this.attributes = {
		 quality:"high",
		 wmode:"opaque",
		 bgcolor:"#FFFFFF",
		 pluginspage: "http://www.adobe.com/go/getflashplayer",
		 type: "application/x-shockwave-flash",
		 allowScriptAccess: "always",
          classid: "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"
	};
	
	this.setAttributes( config );
	this.applied = false;
	
	if(this.detectFlashVersion(9, 0, 45)) {
		if(this.isIE && !this.isOpera) {
			this.template = new Ext.Template( '<object {objectAttributes}><param name="allowFullScreen" value="true"/>{objectParameters}</object>' )
		} else {
			this.template = new Ext.Template( '<embed {embedAttributes} allowfullscreen="true" />' );
		}
	} else {
		this.template = new Ext.Template(  'This content requires the Adobe Flash Player. '
										   +' <a href=http://www.adobe.com/go/getflash/>Get Flash</a>' );
	}
	
	this.template.compile();
	
	this.paramtersTemplate = new Ext.Template( '<param name="{name}" value="{value}" />' );
	this.paramtersTemplate.compile();
	this.attributesTemplate = new Ext.Template( ' {name}="{value}" ' );
	this.attributesTemplate.compile();
		
	this.events = {
		load : true,
		preinitialize: true,
		initialize: true
	};
}

Mage.FlexObjectApi = {
	objectMap: new Object(),	
	callBack : function( id, eventName, eventData )	{
		eventObj = {
			cancel : false,
			data : eventData
		}
		
		this.objectMap[id].fireEvent( eventName, eventObj );
		
		if(eventObj.cancel) {
			return false;
		} 
		return true;
	},
	registerObject : function( id, obj ) {
		this.objectMap[id] = obj;
	},
	unregisterObject: function( id ) {
		delete( this.objectMap[id] );
	}
}

Ext.extend( Mage.FlexObject,  Ext.util.Observable, { 
						
			setAttribute : function( name, value ) {
				if(!this.applied) {
					this.attributes[name] = value;
                }
			},
			
			getAttribute : function( name ) {
				return this.attributes[name];
			},
			
			setAttributes : function( attributesList ) {
				for ( var key in attributesList )
				{
					if(!this.applied) {
						this.attributes[key] = attributesList[key];
                    }
				}
			},
			
			getAttributes : function( ) {
				return this.attributes;
			},
			
			apply : function( container ) {
				if (!this.applied)	{
					this.setAttribute( "id", Ext.id().replace("-","def"));
					this.template.append( container, this.generateTemplateValues() );	
					Mage.FlexObjectApi.registerObject( this.getAttribute("id"), this );
				}
				this.applied = true;
			},
            
           	applyHTML : function( ) {
				if (!this.applied) {
					this.setAttribute( "id", Ext.id().replace("-","def") );
				}
                
				this.applied = true;
				
				return this.template.applyTemplate( this.generateTemplateValues() );
			},
			
			getApi : function() 
			{
				if (!this.applied) {
                    return false;
                }
				
				return Ext.getDom( this.getAttribute('id') );
			},

			generateTemplateValues : function( )
			{
				var embedAttributes = new Object();
				var objectAttributes = new Object();
				var parameters = new Object();
				for (var key in this.attributes ) {
					var attributeName = key.toLowerCase();
                    this.attributes[key] = this.escapeAttributes( this.attributes[key] );
                    
					switch (attributeName) {   
						case "pluginspage":
							embedAttributes[key] = this.attributes[key];
							break;
						case "src":
						case "movie": 
							embedAttributes['src'] = parameters['movie'] = this.attributes[key];
							break;
						case "type":
							embedAttributes[key]  = this.attributes[key];
						case "classid":
						case "codebase":
							objectAttributes[key] = this.attributes[key];
							break;
						case "id":
							embedAttributes['name'] = this.attributes[key];
						case "width":
						case "height":
						case "align":
						case "vspace": 
						case "hspace":
						case "class":
						case "title":
						case "accesskey":
						case "name":
						case "tabindex":
							embedAttributes[key] = objectAttributes[key] = this.attributes[key];
							break;
						default:
							embedAttributes[key] = parameters[key] = this.attributes[key];
							break;
					}
				}
				var i; 
				var result = new Object();
				result.objectAttributes = '';
				result.objectParameters = '';
				result.embedAttributes  = '';
				
				for ( i in objectAttributes) {
					result.objectAttributes += this.attributesTemplate.applyTemplate( {name:i, value: objectAttributes[i]} );
				}
				
				for ( i in embedAttributes)	{
					result.embedAttributes += this.attributesTemplate.applyTemplate( {name:i, value: embedAttributes[i]} );
				}
				
				for ( i in parameters) {
					result.objectParameters += this.paramtersTemplate.applyTemplate( {name:i, value: parameters[i]} );
				}
				
				return result;
			},
            escapeAttributes: function (value) {
                return value.replace(new RegExp("&","g"), "&amp;");
            },
			detectFlashVersion : function( reqMajorVer, reqMinorVer, reqRevision ) {
				var versionStr = this.getSwfVer();
			    if (versionStr == -1 ) {
			        return false;
			    } else if (versionStr != 0) {
			        if(this.isIE && this.isWin && !this.isOpera) {
			            // Given "WIN 2,0,0,11"
			            tempArray         = versionStr.split(" ");  // ["WIN", "2,0,0,11"]
			            tempString        = tempArray[1];           // "2,0,0,11"
			            versionArray      = tempString.split(",");  // ['2', '0', '0', '11']
			        } else {
			            versionArray      = versionStr.split(".");
			        }
			        var versionMajor      = versionArray[0];
			        var versionMinor      = versionArray[1];
			        var versionRevision   = versionArray[2];

			            // is the major.revision >= requested major.revision AND the minor version >= requested minor
			        if (versionMajor > parseFloat(reqMajorVer)) {
			            return true;
			        } else if (versionMajor == parseFloat(reqMajorVer)) {
			            if (versionMinor > parseFloat(reqMinorVer))
			                return true;
			            else if (versionMinor == parseFloat(reqMinorVer)) {
			                if (versionRevision >= parseFloat(reqRevision))
			                    return true;
			            }
			        }
			        return false;
			    }
			},

			controlVersion : function () {
			    var version;
			    var axo;
			    var e;
			    try {
			        // version will be set for 7.X or greater players
			        axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
			        version = axo.GetVariable("$version");
			    } catch (e) {
			    }

			    if (!version) {
			        try {
			            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
			            version = "WIN 6,0,21,0";
			            axo.AllowScriptAccess = "always";
			            version = axo.GetVariable("$version");

			        } catch (e) {
			        }
			    }

			    if (!version) {
			        try {
			            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			            version = axo.GetVariable("$version");
			        } catch (e) {
			        }
			    }

			    if (!version) {
			        try {
			            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.3");
			            version = "WIN 3,0,18,0";
			        } catch (e) {
			        }
			    }

			    if (!version) {
			        try {
			            axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			            version = "WIN 2,0,0,11";
			        } catch (e) {
			            version = -1;
			        }
			    }
			    return version;
			},

			getSwfVer : function (){
			    var flashVer = -1;
			    if (navigator.plugins != null && navigator.plugins.length > 0) {
			        if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
			            var swVer2 = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
			            var flashDescription = navigator.plugins["Shockwave Flash" + swVer2].description;           
			            var descArray = flashDescription.split(" ");
			            var tempArrayMajor = descArray[2].split(".");
			            var versionMajor = tempArrayMajor[0];
			            var versionMinor = tempArrayMajor[1];
			            if ( descArray[3] != "" ) {
			                tempArrayMinor = descArray[3].split("r");
			            } else {
			                tempArrayMinor = descArray[4].split("r");
			            }
			            var versionRevision = tempArrayMinor[1] > 0 ? tempArrayMinor[1] : 0;
			            var flashVer = versionMajor + "." + versionMinor + "." + versionRevision;
			        }
			    }
			    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.6") != -1) flashVer = 4;
			    else if (navigator.userAgent.toLowerCase().indexOf("webtv/2.5") != -1) flashVer = 3;
			    else if (navigator.userAgent.toLowerCase().indexOf("webtv") != -1) flashVer = 2;
			    else if ( this.isIE && this.isWin && !this.isOpera ) {
			        flashVer = this.controlVersion();
			    }
			    return flashVer;
			}
} );