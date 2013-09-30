/**
  *
  *  Copyright 2005 Sabre Airline Solutions
  *
  *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
  *  file except in compliance with the License. You may obtain a copy of the License at
  *
  *         http://www.apache.org/licenses/LICENSE-2.0
  *
  *  Unless required by applicable law or agreed to in writing, software distributed under the
  *  License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
  *  either express or implied. See the License for the specific language governing permissions
  *  and limitations under the License.
  **/


//-------------------- rico.js
var Rico = {
  Version: '1.1-beta2'
}

Rico.ArrayExtensions = new Array();

if (Object.prototype.extend) {
   // in prototype.js...
   Rico.ArrayExtensions[ Rico.ArrayExtensions.length ] = Object.prototype.extend;
}

if (Array.prototype.push) {
   // in prototype.js...
   Rico.ArrayExtensions[ Rico.ArrayExtensions.length ] = Array.prototype.push;
}

if (!Array.prototype.remove) {
   Array.prototype.remove = function(dx) {
      if( isNaN(dx) || dx > this.length )
         return false;
      for( var i=0,n=0; i<this.length; i++ )
         if( i != dx )
            this[n++]=this[i];
      this.length-=1;
   };
  Rico.ArrayExtensions[ Rico.ArrayExtensions.length ] = Array.prototype.remove;
}

if (!Array.prototype.removeItem) {
   Array.prototype.removeItem = function(item) {
      for ( var i = 0 ; i < this.length ; i++ )
         if ( this[i] == item ) {
            this.remove(i);
            break;
         }
   };
  Rico.ArrayExtensions[ Rico.ArrayExtensions.length ] = Array.prototype.removeItem;
}

if (!Array.prototype.indices) {
   Array.prototype.indices = function() {
      var indexArray = new Array();
      for ( index in this ) {
         var ignoreThis = false;
         for ( var i = 0 ; i < Rico.ArrayExtensions.length ; i++ ) {
            if ( this[index] == Rico.ArrayExtensions[i] ) {
               ignoreThis = true;
               break;
            }
         }
         if ( !ignoreThis )
            indexArray[ indexArray.length ] = index;
      }
      return indexArray;
   }
  Rico.ArrayExtensions[ Rico.ArrayExtensions.length ] = Array.prototype.indices;
}

// Create the loadXML method and xml getter for Mozilla
if ( window.DOMParser &&
	  window.XMLSerializer &&
	  window.Node && Node.prototype && Node.prototype.__defineGetter__ ) {

   if (!Document.prototype.loadXML) {
      Document.prototype.loadXML = function (s) {
         var doc2 = (new DOMParser()).parseFromString(s, "text/xml");
         while (this.hasChildNodes())
            this.removeChild(this.lastChild);

         for (var i = 0; i < doc2.childNodes.length; i++) {
            this.appendChild(this.importNode(doc2.childNodes[i], true));
         }
      };
	}

	Document.prototype.__defineGetter__( "xml",
	   function () {
		   return (new XMLSerializer()).serializeToString(this);
	   }
	 );
}

document.getElementsByTagAndClassName = function(tagName, className) {
  if ( tagName == null )
     tagName = '*';

  var children = document.getElementsByTagName(tagName) || document.all;
  var elements = new Array();

  if ( className == null )
    return children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var classNames = child.className.split(' ');
    for (var j = 0; j < classNames.length; j++) {
      if (classNames[j] == className) {
        elements.push(child);
        break;
      }
    }
  }

  return elements;
}


//-------------------- ricoAccordion.js

Rico.Accordion = Class.create();

Rico.Accordion.prototype = {

   initialize: function(container, options) {
      this.container            = $(container);
      this.lastExpandedTab      = null;
      this.accordionTabs        = new Array();
      this.setOptions(options);
      this._attachBehaviors();

      this.container.style.borderBottom = '1px solid ' + this.options.borderColor;

      // set the initial visual state...
      for ( var i=1 ; i < this.accordionTabs.length ; i++ )
      {
         this.accordionTabs[i].collapse();
         this.accordionTabs[i].content.style.display = 'none';
      }
      this.lastExpandedTab = this.accordionTabs[0];
      this.lastExpandedTab.content.style.height = this.options.panelHeight + "px";
      this.lastExpandedTab.showExpanded();
      this.lastExpandedTab.titleBar.style.fontWeight = this.options.expandedFontWeight;
   },

   setOptions: function(options) {
      this.options = {
         expandedBg          : '#63699c',
         hoverBg             : '#63699c',
         collapsedBg         : '#6b79a5',
         expandedTextColor   : '#ffffff',
         expandedFontWeight  : 'bold',
         hoverTextColor      : '#ffffff',
         collapsedTextColor  : '#ced7ef',
         collapsedFontWeight : 'normal',
         hoverTextColor      : '#ffffff',
         borderColor         : '#1f669b',
         panelHeight         : 200,
         onHideTab           : null,
         onShowTab           : null
      }.extend(options || {});
   },

   showTabByIndex: function( anIndex, animate ) {
      var doAnimate = arguments.length == 1 ? true : animate;
      this.showTab( this.accordionTabs[anIndex], doAnimate );
   },

   showTab: function( accordionTab, animate ) {

      var doAnimate = arguments.length == 1 ? true : animate;

      if ( this.options.onHideTab )
         this.options.onHideTab(this.lastExpandedTab);

      this.lastExpandedTab.showCollapsed(); 
      var accordion = this;
      var lastExpandedTab = this.lastExpandedTab;

      this.lastExpandedTab.content.style.height = (this.options.panelHeight - 1) + 'px';
      accordionTab.content.style.display = '';

      accordionTab.titleBar.style.fontWeight = this.options.expandedFontWeight;

      if ( doAnimate ) {
         new Effect.AccordionSize( this.lastExpandedTab.content,
                                   accordionTab.content,
                                   1,
                                   this.options.panelHeight,
                                   100, 10,
                                   { complete: function() {accordion.showTabDone(lastExpandedTab)} } );
         this.lastExpandedTab = accordionTab;
      }
      else {
         this.lastExpandedTab.content.style.height = "1px";
         accordionTab.content.style.height = this.options.panelHeight + "px";
         this.lastExpandedTab = accordionTab;
         this.showTabDone(lastExpandedTab);
      }
   },

   showTabDone: function(collapsedTab) {
      collapsedTab.content.style.display = 'none';
      this.lastExpandedTab.showExpanded();
      if ( this.options.onShowTab )
         this.options.onShowTab(this.lastExpandedTab);
   },

   _attachBehaviors: function() {
      var panels = this._getDirectChildrenByTag(this.container, 'DIV');
      for ( var i = 0 ; i < panels.length ; i++ ) {

         var tabChildren = this._getDirectChildrenByTag(panels[i],'DIV');
         if ( tabChildren.length != 2 )
            continue; // unexpected

         var tabTitleBar   = tabChildren[0];
         var tabContentBox = tabChildren[1];
         this.accordionTabs.push( new Rico.Accordion.Tab(this,tabTitleBar,tabContentBox) );
      }
   },

   _getDirectChildrenByTag: function(e, tagName) {
      var kids = new Array();
      var allKids = e.childNodes;
      for( var i = 0 ; i < allKids.length ; i++ )
         if ( allKids[i] && allKids[i].tagName && allKids[i].tagName == tagName )
            kids.push(allKids[i]);
      return kids;
   }

};

Rico.Accordion.Tab = Class.create();

Rico.Accordion.Tab.prototype = {

   initialize: function(accordion, titleBar, content) {
      this.accordion = accordion;
      this.titleBar  = titleBar;
      this.content   = content;
      this._attachBehaviors();
   },

   collapse: function() {
      this.showCollapsed();
      this.content.style.height = "1px";
   },

   showCollapsed: function() {
      this.expanded = false;
      this.titleBar.style.backgroundColor = this.accordion.options.collapsedBg;
      this.titleBar.style.color           = this.accordion.options.collapsedTextColor;
      this.titleBar.style.fontWeight      = this.accordion.options.collapsedFontWeight;
      this.content.style.overflow = "hidden";
   },

   showExpanded: function() {
      this.expanded = true;
      this.titleBar.style.backgroundColor = this.accordion.options.expandedBg;
      this.titleBar.style.color           = this.accordion.options.expandedTextColor;
      this.content.style.overflow         = "visible";
   },

   titleBarClicked: function(e) {
      if ( this.accordion.lastExpandedTab == this )
         return;
      this.accordion.showTab(this);
   },

   hover: function(e) {
		this.titleBar.style.backgroundColor = this.accordion.options.hoverBg;
		this.titleBar.style.color           = this.accordion.options.hoverTextColor;
   },

   unhover: function(e) {
      if ( this.expanded ) {
         this.titleBar.style.backgroundColor = this.accordion.options.expandedBg;
         this.titleBar.style.color           = this.accordion.options.expandedTextColor;
      }
      else {
         this.titleBar.style.backgroundColor = this.accordion.options.collapsedBg;
         this.titleBar.style.color           = this.accordion.options.collapsedTextColor;
      }
   },

   _attachBehaviors: function() {
      this.content.style.border = "1px solid " + this.accordion.options.borderColor;
      this.content.style.borderTopWidth    = "0px";
      this.content.style.borderBottomWidth = "0px";
      this.content.style.margin            = "0px";

      this.titleBar.onclick     = this.titleBarClicked.bindAsEventListener(this);
      this.titleBar.onmouseover = this.hover.bindAsEventListener(this);
      this.titleBar.onmouseout  = this.unhover.bindAsEventListener(this);
   }

};


//-------------------- ricoAjaxEngine.js

Rico.AjaxEngine = Class.create();

Rico.AjaxEngine.prototype = {

   initialize: function() {
      this.ajaxElements = new Array();
      this.ajaxObjects  = new Array();
      this.requestURLS  = new Array();
   },

   registerAjaxElement: function( anId, anElement ) {
      if ( arguments.length == 1 )
         anElement = $(anId);
      this.ajaxElements[anId] = anElement;
   },

   registerAjaxObject: function( anId, anObject ) {
      this.ajaxObjects[anId] = anObject;
   },

   registerRequest: function (requestLogicalName, requestURL) {
      this.requestURLS[requestLogicalName] = requestURL;
   },

   sendRequest: function(requestName) {
      var requestURL = this.requestURLS[requestName];
      if ( requestURL == null )
         return;

      var queryString = "";
      
      if ( arguments.length > 1 ) {
      	 if(typeof(arguments[1]) == "object" && arguments[1].length != undefined) {
	      	 queryString = this._createQueryString(arguments[1], 0);
      	 }
      	 else {
	         queryString = this._createQueryString(arguments, 1);
	     }         
       }
             
      new Ajax.Request(requestURL, this._requestOptions(queryString));
   },

   sendRequestWithData: function(requestName, xmlDocument) {
      var requestURL = this.requestURLS[requestName];
      if ( requestURL == null )
         return;

      var queryString = "";
      if ( arguments.length > 2 ) {
      	 if(typeof(arguments[2]) == "object" && arguments[2].length != undefined) {
	      	 queryString = this._createQueryString(arguments[2], 0);
      	 }
      	 else {
	         queryString = this._createQueryString(arguments, 2);
	     }         
       }             

      new Ajax.Request(requestURL + "?" + queryString, this._requestOptions(null,xmlDocument));
   },

   sendRequestAndUpdate: function(requestName,container,options) {
      var requestURL = this.requestURLS[requestName];
      if ( requestURL == null )
         return;

      var queryString = "";
      if ( arguments.length > 3 ) {
      	 if(typeof(arguments[3]) == "object" && arguments[3].length != undefined) {
	      	 queryString = this._createQueryString(arguments[3], 0);
      	 }
      	 else {
	         queryString = this._createQueryString(arguments, 3);
	     }         
       }  
             
      var updaterOptions = this._requestOptions(queryString);
      updaterOptions.onComplete = null;
      updaterOptions.extend(options);

      new Ajax.Updater(container, requestURL, updaterOptions);
   },

   sendRequestWithDataAndUpdate: function(requestName,xmlDocument,container,options) {
      var requestURL = this.requestURLS[requestName];
      if ( requestURL == null )
         return;

      var queryString = "";
      if ( arguments.length > 4 ) {
      	 if(typeof(arguments[4]) == "object" && arguments[4].length != undefined) {
	      	 queryString = this._createQueryString(arguments[4], 0);
      	 }
      	 else {
	         queryString = this._createQueryString(arguments, 4);
	     }         
       }


      var updaterOptions = this._requestOptions(queryString,xmlDocument);
      updaterOptions.onComplete = null;
      updaterOptions.extend(options);

      new Ajax.Updater(container, requestURL + "?" + queryString, updaterOptions);
   },

   // Private -- not part of intended engine API --------------------------------------------------------------------

   _requestOptions: function(queryString,xmlDoc) {
      var self = this;

      var requestHeaders = ['X-Rico-Version', Rico.Version ];
      var sendMethod = "post"
      if ( arguments[1] )
         requestHeaders.push( 'Content-type', 'text/xml' );
      else
         sendMethod = "get";

      return { requestHeaders: requestHeaders,
               parameters:     queryString,
               postBody:       arguments[1] ? xmlDoc : null,
               method:         sendMethod,
               onComplete:     self._onRequestComplete.bind(self) };
   },

   _createQueryString: function( theArgs, offset ) {
   	  var self = this;
      var queryString = ""
      for ( var i = offset ; i < theArgs.length ; i++ ) {
          if ( i != offset )
            queryString += "&";

          var anArg = theArgs[i];
                  
          if ( anArg.name != undefined && anArg.value != undefined ) {
            queryString += anArg.name +  "=" + escape(anArg.value);
          }
          else {
             var ePos  = anArg.indexOf('=');
             var argName  = anArg.substring( 0, ePos );
             var argValue = anArg.substring( ePos + 1 );
             queryString += argName + "=" + escape(argValue);
          }
      }

      return queryString;
   },
   _onRequestComplete : function(request) {

      //!!TODO: error handling infrastructure?? 
      if (request.status != 200)
        return;

      var response = request.responseXML.getElementsByTagName("ajax-response");
      if (response == null || response.length != 1)
         return;
      this._processAjaxResponse( response[0].childNodes );
   },

   _processAjaxResponse: function( xmlResponseElements ) {
      for ( var i = 0 ; i < xmlResponseElements.length ; i++ ) {
         var responseElement = xmlResponseElements[i];

         // only process nodes of type element.....
         if ( responseElement.nodeType != 1 )
            continue;

         var responseType = responseElement.getAttribute("type");
         var responseId   = responseElement.getAttribute("id");

         if ( responseType == "object" )
            this._processAjaxObjectUpdate( this.ajaxObjects[ responseId ], responseElement );
         else if ( responseType == "element" )
            this._processAjaxElementUpdate( this.ajaxElements[ responseId ], responseElement );
         else
            alert('unrecognized AjaxResponse type : ' + responseType );
      }
   },

   _processAjaxObjectUpdate: function( ajaxObject, responseElement ) {
      ajaxObject.ajaxUpdate( responseElement );
   },

   _processAjaxElementUpdate: function( ajaxElement, responseElement ) {
      ajaxElement.innerHTML = RicoUtil.getContentAsString(responseElement);
   }

}

var ajaxEngine = new Rico.AjaxEngine();


//-------------------- ricoColor.js
Rico.Color = Class.create();

Rico.Color.prototype = {

   initialize: function(red, green, blue) {
      this.rgb = { r: red, g : green, b : blue };
   },

   setRed: function(r) {
      this.rgb.r = r;
   },

   setGreen: function(g) {
      this.rgb.g = g;
   },

   setBlue: function(b) {
      this.rgb.b = b;
   },

   setHue: function(h) {

      // get an HSB model, and set the new hue...
      var hsb = this.asHSB();
      hsb.h = h;

      // convert back to RGB...
      this.rgb = Rico.Color.HSBtoRGB(hsb.h, hsb.s, hsb.b);
   },

   setSaturation: function(s) {
      // get an HSB model, and set the new hue...
      var hsb = this.asHSB();
      hsb.s = s;

      // convert back to RGB and set values...
      this.rgb = Rico.Color.HSBtoRGB(hsb.h, hsb.s, hsb.b);
   },

   setBrightness: function(b) {
      // get an HSB model, and set the new hue...
      var hsb = this.asHSB();
      hsb.b = b;

      // convert back to RGB and set values...
      this.rgb = Rico.Color.HSBtoRGB( hsb.h, hsb.s, hsb.b );
   },

   darken: function(percent) {
      var hsb  = this.asHSB();
      this.rgb = Rico.Color.HSBtoRGB(hsb.h, hsb.s, Math.max(hsb.b - percent,0));
   },

   brighten: function(percent) {
      var hsb  = this.asHSB();
      this.rgb = Rico.Color.HSBtoRGB(hsb.h, hsb.s, Math.min(hsb.b + percent,1));
   },

   blend: function(other) {
      this.rgb.r = Math.floor((this.rgb.r + other.rgb.r)/2);
      this.rgb.g = Math.floor((this.rgb.g + other.rgb.g)/2);
      this.rgb.b = Math.floor((this.rgb.b + other.rgb.b)/2);
   },

   isBright: function() {
      var hsb = this.asHSB();
      return this.asHSB().b > 0.5;
   },

   isDark: function() {
      return ! this.isBright();
   },

   asRGB: function() {
      return "rgb(" + this.rgb.r + "," + this.rgb.g + "," + this.rgb.b + ")";
   },

   asHex: function() {
      return "#" + this.rgb.r.toColorPart() + this.rgb.g.toColorPart() + this.rgb.b.toColorPart();
   },

   asHSB: function() {
      return Rico.Color.RGBtoHSB(this.rgb.r, this.rgb.g, this.rgb.b);
   },

   toString: function() {
      return this.asHex();
   }

};

Rico.Color.createFromHex = function(hexCode) {

   if ( hexCode.indexOf('#') == 0 )
      hexCode = hexCode.substring(1);
   var red   = hexCode.substring(0,2);
   var green = hexCode.substring(2,4);
   var blue  = hexCode.substring(4,6);
   return new Rico.Color( parseInt(red,16), parseInt(green,16), parseInt(blue,16) );
}

/**
 * Factory method for creating a color from the background of
 * an HTML element.
 */
Rico.Color.createColorFromBackground = function(elem) {

   var actualColor = RicoUtil.getElementsComputedStyle($(elem), "backgroundColor", "background-color");

   if ( actualColor == "transparent" && elem.parent )
      return Rico.Color.createColorFromBackground(elem.parent);

   if ( actualColor == null )
      return new Rico.Color(255,255,255);

   if ( actualColor.indexOf("rgb(") == 0 ) {
      var colors = actualColor.substring(4, actualColor.length - 1 );
      var colorArray = colors.split(",");
      return new Rico.Color( parseInt( colorArray[0] ),
                            parseInt( colorArray[1] ),
                            parseInt( colorArray[2] )  );

   }
   else if ( actualColor.indexOf("#") == 0 ) {
      var redPart   = parseInt(actualColor.substring(1,3), 16);
      var greenPart = parseInt(actualColor.substring(3,5), 16);
      var bluePart  = parseInt(actualColor.substring(5), 16);
      return new Rico.Color( redPart, greenPart, bluePart );
   }
   else
      return new Rico.Color(255,255,255);
}

Rico.Color.HSBtoRGB = function(hue, saturation, brightness) {

   var red   = 0;
	var green = 0;
	var blue  = 0;

   if (saturation == 0) {
      red = parseInt(brightness * 255.0 + 0.5);
	   green = red;
	   blue = red;
	}
	else {
      var h = (hue - Math.floor(hue)) * 6.0;
      var f = h - Math.floor(h);
      var p = brightness * (1.0 - saturation);
      var q = brightness * (1.0 - saturation * f);
      var t = brightness * (1.0 - (saturation * (1.0 - f)));

      switch (parseInt(h)) {
         case 0:
            red   = (brightness * 255.0 + 0.5);
            green = (t * 255.0 + 0.5);
            blue  = (p * 255.0 + 0.5);
            break;
         case 1:
            red   = (q * 255.0 + 0.5);
            green = (brightness * 255.0 + 0.5);
            blue  = (p * 255.0 + 0.5);
            break;
         case 2:
            red   = (p * 255.0 + 0.5);
            green = (brightness * 255.0 + 0.5);
            blue  = (t * 255.0 + 0.5);
            break;
         case 3:
            red   = (p * 255.0 + 0.5);
            green = (q * 255.0 + 0.5);
            blue  = (brightness * 255.0 + 0.5);
            break;
         case 4:
            red   = (t * 255.0 + 0.5);
            green = (p * 255.0 + 0.5);
            blue  = (brightness * 255.0 + 0.5);
            break;
          case 5:
            red   = (brightness * 255.0 + 0.5);
            green = (p * 255.0 + 0.5);
            blue  = (q * 255.0 + 0.5);
            break;
	    }
	}

   return { r : parseInt(red), g : parseInt(green) , b : parseInt(blue) };
}

Rico.Color.RGBtoHSB = function(r, g, b) {

   var hue;
   var saturaton;
   var brightness;

   var cmax = (r > g) ? r : g;
   if (b > cmax)
      cmax = b;

   var cmin = (r < g) ? r : g;
   if (b < cmin)
      cmin = b;

   brightness = cmax / 255.0;
   if (cmax != 0)
      saturation = (cmax - cmin)/cmax;
   else
      saturation = 0;

   if (saturation == 0)
      hue = 0;
   else {
      var redc   = (cmax - r)/(cmax - cmin);
    	var greenc = (cmax - g)/(cmax - cmin);
    	var bluec  = (cmax - b)/(cmax - cmin);

    	if (r == cmax)
    	   hue = bluec - greenc;
    	else if (g == cmax)
    	   hue = 2.0 + redc - bluec;
      else
    	   hue = 4.0 + greenc - redc;

    	hue = hue / 6.0;
    	if (hue < 0)
    	   hue = hue + 1.0;
   }

   return { h : hue, s : saturation, b : brightness };
}


//-------------------- ricoCorner.js

Rico.Corner = {

   round: function(e, options) {
      var e = $(e);
      this._setOptions(options);

      var color = this.options.color;
      if ( this.options.color == "fromElement" )
         color = this._background(e);

      var bgColor = this.options.bgColor;
      if ( this.options.bgColor == "fromParent" )
         bgColor = this._background(e.offsetParent);

      this._roundCornersImpl(e, color, bgColor);
   },

   _roundCornersImpl: function(e, color, bgColor) {
      if(this.options.border)
         this._renderBorder(e,bgColor);
      if(this._isTopRounded())
         this._roundTopCorners(e,color,bgColor);
      if(this._isBottomRounded())
         this._roundBottomCorners(e,color,bgColor);
   },

   _renderBorder: function(el,bgColor) {
      var borderValue = "1px solid " + this._borderColor(bgColor);
      var borderL = "border-left: "  + borderValue;
      var borderR = "border-right: " + borderValue;
      var style   = "style='" + borderL + ";" + borderR +  "'";
      el.innerHTML = "<div " + style + ">" + el.innerHTML + "</div>"
   },

   _roundTopCorners: function(el, color, bgColor) {
      var corner = this._createCorner(bgColor);
      for(var i=0 ; i < this.options.numSlices ; i++ )
         corner.appendChild(this._createCornerSlice(color,bgColor,i,"top"));
      el.style.paddingTop = 0;
      el.insertBefore(corner,el.firstChild);
   },

   _roundBottomCorners: function(el, color, bgColor) {
      var corner = this._createCorner(bgColor);
      for(var i=(this.options.numSlices-1) ; i >= 0 ; i-- )
         corner.appendChild(this._createCornerSlice(color,bgColor,i,"bottom"));
      el.style.paddingBottom = 0;
      el.appendChild(corner);
   },

   _createCorner: function(bgColor) {
      var corner = document.createElement("div");
      corner.style.backgroundColor = (this._isTransparent() ? "transparent" : bgColor);
      return corner;
   },

   _createCornerSlice: function(color,bgColor, n, position) {
      var slice = document.createElement("span");

      var inStyle = slice.style;
      inStyle.backgroundColor = color;
      inStyle.display  = "block";
      inStyle.height   = "1px";
      inStyle.overflow = "hidden";
      inStyle.fontSize = "1px";

      var borderColor = this._borderColor(color,bgColor);
      if ( this.options.border && n == 0 ) {
         inStyle.borderTopStyle    = "solid";
         inStyle.borderTopWidth    = "1px";
         inStyle.borderLeftWidth   = "0px";
         inStyle.borderRightWidth  = "0px";
         inStyle.borderBottomWidth = "0px";
         inStyle.height            = "0px"; // assumes css compliant box model
         inStyle.borderColor       = borderColor;
      }
      else if(borderColor) {
         inStyle.borderColor = borderColor;
         inStyle.borderStyle = "solid";
         inStyle.borderWidth = "0px 1px";
      }

      if ( !this.options.compact && (n == (this.options.numSlices-1)) )
         inStyle.height = "2px";

      this._setMargin(slice, n, position);
      this._setBorder(slice, n, position);

      return slice;
   },

   _setOptions: function(options) {
      this.options = {
         corners : "all",
         color   : "fromElement",
         bgColor : "fromParent",
         blend   : true,
         border  : false,
         compact : false
      }.extend(options || {});

      this.options.numSlices = this.options.compact ? 2 : 4;
      if ( this._isTransparent() )
         this.options.blend = false;
   },

   _whichSideTop: function() {
      if ( this._hasString(this.options.corners, "all", "top") )
         return "";

      if ( this.options.corners.indexOf("tl") >= 0 && this.options.corners.indexOf("tr") >= 0 )
         return "";

      if (this.options.corners.indexOf("tl") >= 0)
         return "left";
      else if (this.options.corners.indexOf("tr") >= 0)
          return "right";
      return "";
   },

   _whichSideBottom: function() {
      if ( this._hasString(this.options.corners, "all", "bottom") )
         return "";

      if ( this.options.corners.indexOf("bl")>=0 && this.options.corners.indexOf("br")>=0 )
         return "";

      if(this.options.corners.indexOf("bl") >=0)
         return "left";
      else if(this.options.corners.indexOf("br")>=0)
         return "right";
      return "";
   },

   _borderColor : function(color,bgColor) {
      if ( color == "transparent" )
         return bgColor;
      else if ( this.options.border )
         return this.options.border;
      else if ( this.options.blend )
         return this._blend( bgColor, color );
      else
         return "";
   },


   _setMargin: function(el, n, corners) {
      var marginSize = this._marginSize(n);
      var whichSide = corners == "top" ? this._whichSideTop() : this._whichSideBottom();

      if ( whichSide == "left" ) {
         el.style.marginLeft = marginSize + "px"; el.style.marginRight = "0px";
      }
      else if ( whichSide == "right" ) {
         el.style.marginRight = marginSize + "px"; el.style.marginLeft  = "0px";
      }
      else {
         el.style.marginLeft = marginSize + "px"; el.style.marginRight = marginSize + "px";
      }
   },

   _setBorder: function(el,n,corners) {
      var borderSize = this._borderSize(n);
      var whichSide = corners == "top" ? this._whichSideTop() : this._whichSideBottom();

      if ( whichSide == "left" ) {
         el.style.borderLeftWidth = borderSize + "px"; el.style.borderRightWidth = "0px";
      }
      else if ( whichSide == "right" ) {
         el.style.borderRightWidth = borderSize + "px"; el.style.borderLeftWidth  = "0px";
      }
      else {
         el.style.borderLeftWidth = borderSize + "px"; el.style.borderRightWidth = borderSize + "px";
      }
   },

   _marginSize: function(n) {
      if ( this._isTransparent() )
         return 0;

      var marginSizes          = [ 5, 3, 2, 1 ];
      var blendedMarginSizes   = [ 3, 2, 1, 0 ];
      var compactMarginSizes   = [ 2, 1 ];
      var smBlendedMarginSizes = [ 1, 0 ];

      if ( this.options.compact && this.options.blend )
         return smBlendedMarginSizes[n];
      else if ( this.options.compact )
         return compactMarginSizes[n];
      else if ( this.options.blend )
         return blendedMarginSizes[n];
      else
         return marginSizes[n];
   },

   _borderSize: function(n) {
      var transparentBorderSizes = [ 5, 3, 2, 1 ];
      var blendedBorderSizes     = [ 2, 1, 1, 1 ];
      var compactBorderSizes     = [ 1, 0 ];
      var actualBorderSizes      = [ 0, 2, 0, 0 ];

      if ( this.options.compact && (this.options.blend || this._isTransparent()) )
         return 1;
      else if ( this.options.compact )
         return compactBorderSizes[n];
      else if ( this.options.blend )
         return blendedBorderSizes[n];
      else if ( this.options.border )
         return actualBorderSizes[n];
      else if ( this._isTransparent() )
         return transparentBorderSizes[n];
      return 0;
   },

   _hasString: function(str) { for(var i=1 ; i<arguments.length ; i++) if (str.indexOf(arguments[i]) >= 0) return true; return false; },
   _blend: function(c1, c2) { var cc1 = Rico.Color.createFromHex(c1); cc1.blend(Rico.Color.createFromHex(c2)); return cc1; },
   _background: function(el) { try { return Rico.Color.createColorFromBackground(el).asHex(); } catch(err) { return "#ffffff"; } },
   _isTransparent: function() { return this.options.color == "transparent"; },
   _isTopRounded: function() { return this._hasString(this.options.corners, "all", "top", "tl", "tr"); },
   _isBottomRounded: function() { return this._hasString(this.options.corners, "all", "bottom", "bl", "br"); },
   _hasSingleTextChild: function(el) { return el.childNodes.length == 1 && el.childNodes[0].nodeType == 3; }
}


//-------------------- ricoDragAndDrop.js
Rico.DragAndDrop = Class.create();

Rico.DragAndDrop.prototype = {

   initialize: function() {
      this.dropZones                = new Array();
      this.draggables               = new Array();
      this.currentDragObjects       = new Array();
      this.dragElement              = null;
      this.lastSelectedDraggable    = null;
      this.currentDragObjectVisible = false;
      this.interestedInMotionEvents = false;
   },

   registerDropZone: function(aDropZone) {
      this.dropZones[ this.dropZones.length ] = aDropZone;
   },

   deregisterDropZone: function(aDropZone) {
      var newDropZones = new Array();
      var j = 0;
      for ( var i = 0 ; i < this.dropZones.length ; i++ ) {
         if ( this.dropZones[i] != aDropZone )
            newDropZones[j++] = this.dropZones[i];
      }

      this.dropZones = newDropZones;
   },

   clearDropZones: function() {
      this.dropZones = new Array();
   },

   registerDraggable: function( aDraggable ) {
      this.draggables[ this.draggables.length ] = aDraggable;
      this._addMouseDownHandler( aDraggable );
   },

   clearSelection: function() {
      for ( var i = 0 ; i < this.currentDragObjects.length ; i++ )
         this.currentDragObjects[i].deselect();
      this.currentDragObjects = new Array();
      this.lastSelectedDraggable = null;
   },

   hasSelection: function() {
      return this.currentDragObjects.length > 0;
   },

   setStartDragFromElement: function( e, mouseDownElement ) {
      this.origPos = RicoUtil.toDocumentPosition(mouseDownElement);
      this.startx = e.screenX - this.origPos.x
      this.starty = e.screenY - this.origPos.y
      //this.startComponentX = e.layerX ? e.layerX : e.offsetX;
      //this.startComponentY = e.layerY ? e.layerY : e.offsetY;
      //this.adjustedForDraggableSize = false;

      this.interestedInMotionEvents = this.hasSelection();
      this._terminateEvent(e);
   },

   updateSelection: function( draggable, extendSelection ) {
      if ( ! extendSelection )
         this.clearSelection();

      if ( draggable.isSelected() ) {
         this.currentDragObjects.removeItem(draggable);
         draggable.deselect();
         if ( draggable == this.lastSelectedDraggable )
            this.lastSelectedDraggable = null;
      }
      else {
         this.currentDragObjects[ this.currentDragObjects.length ] = draggable;
         draggable.select();
         this.lastSelectedDraggable = draggable;
      }
   },

   _mouseDownHandler: function(e) {
      if ( arguments.length == 0 )
         e = event;

      // if not button 1 ignore it...
      var nsEvent = e.which != undefined;
      if ( (nsEvent && e.which != 1) || (!nsEvent && e.button != 1))
         return;

      var eventTarget      = e.target ? e.target : e.srcElement;
      var draggableObject  = eventTarget.draggable;

      var candidate = eventTarget;
      while (draggableObject == null && candidate.parentNode) {
         candidate = candidate.parentNode;
         draggableObject = candidate.draggable;
      }
   
      if ( draggableObject == null )
         return;

      this.updateSelection( draggableObject, e.ctrlKey );

      // clear the drop zones postion cache...
      if ( this.hasSelection() )
         for ( var i = 0 ; i < this.dropZones.length ; i++ )
            this.dropZones[i].clearPositionCache();

      this.setStartDragFromElement( e, draggableObject.getMouseDownHTMLElement() );
   },


   _mouseMoveHandler: function(e) {
      var nsEvent = e.which != undefined;
      if ( !this.interestedInMotionEvents ) {
         this._terminateEvent(e);
         return;
      }

      if ( ! this.hasSelection() )
         return;

      if ( ! this.currentDragObjectVisible )
         this._startDrag(e);

      if ( !this.activatedDropZones )
         this._activateRegisteredDropZones();

      //if ( !this.adjustedForDraggableSize )
      //   this._adjustForDraggableSize(e);

      this._updateDraggableLocation(e);
      this._updateDropZonesHover(e);

      this._terminateEvent(e);
   },

   _makeDraggableObjectVisible: function(e)
   {
      if ( !this.hasSelection() )
         return;

      var dragElement;
      if ( this.currentDragObjects.length > 1 )
         dragElement = this.currentDragObjects[0].getMultiObjectDragGUI(this.currentDragObjects);
      else
         dragElement = this.currentDragObjects[0].getSingleObjectDragGUI();

      // go ahead and absolute position it...
      if ( RicoUtil.getElementsComputedStyle(dragElement, "position")  != "absolute" )
         dragElement.style.position = "absolute";

      // need to parent him into the document...
      if ( dragElement.parentNode == null || dragElement.parentNode.nodeType == 11 )
         document.body.appendChild(dragElement);

      this.dragElement = dragElement;
      this._updateDraggableLocation(e);

      this.currentDragObjectVisible = true;
   },

   /**
   _adjustForDraggableSize: function(e) {
      var dragElementWidth  = this.dragElement.offsetWidth;
      var dragElementHeight = this.dragElement.offsetHeight;
      if ( this.startComponentX > dragElementWidth )
         this.startx -= this.startComponentX - dragElementWidth + 2;
      if ( e.offsetY ) {
         if ( this.startComponentY > dragElementHeight )
            this.starty -= this.startComponentY - dragElementHeight + 2;
      }
      this.adjustedForDraggableSize = true;
   },
   **/

   _updateDraggableLocation: function(e) {
      var dragObjectStyle = this.dragElement.style;
      dragObjectStyle.left = (e.screenX - this.startx) + "px"
      dragObjectStyle.top  = (e.screenY - this.starty) + "px";
   },

   _updateDropZonesHover: function(e) {
      var n = this.dropZones.length;
      for ( var i = 0 ; i < n ; i++ ) {
         if ( ! this._mousePointInDropZone( e, this.dropZones[i] ) )
            this.dropZones[i].hideHover();
      }

      for ( var i = 0 ; i < n ; i++ ) {
         if ( this._mousePointInDropZone( e, this.dropZones[i] ) ) {
            if ( this.dropZones[i].canAccept(this.currentDragObjects) )
               this.dropZones[i].showHover();
         }
      }
   },

   _startDrag: function(e) {
      for ( var i = 0 ; i < this.currentDragObjects.length ; i++ )
         this.currentDragObjects[i].startDrag();

      this._makeDraggableObjectVisible(e);
   },

   _mouseUpHandler: function(e) {
      if ( ! this.hasSelection() )
         return;

      var nsEvent = e.which != undefined;
      if ( (nsEvent && e.which != 1) || (!nsEvent && e.button != 1))
         return;

      this.interestedInMotionEvents = false;

      if ( this.dragElement == null ) {
         this._terminateEvent(e);
         return;
      }

      if ( this._placeDraggableInDropZone(e) )
         this._completeDropOperation(e);
      else {
         this._terminateEvent(e);
         new Effect.Position( this.dragElement,
                              this.origPos.x,
                              this.origPos.y,
                              200,
                              20,
                              { complete : this._doCancelDragProcessing.bind(this) } );
      }
   },

   _completeDropOperation: function(e) {
      if ( this.dragElement != this.currentDragObjects[0].getMouseDownHTMLElement() ) {
         if ( this.dragElement.parentNode != null )
            this.dragElement.parentNode.removeChild(this.dragElement);
      }

      this._deactivateRegisteredDropZones();
      this._endDrag();
      this.clearSelection();
      this.dragElement = null;
      this.currentDragObjectVisible = false;
      this._terminateEvent(e);
   },

   _doCancelDragProcessing: function() {
      this._cancelDrag();

      if ( this.dragElement != this.currentDragObjects[0].getMouseDownHTMLElement() ) {
         if ( this.dragElement.parentNode != null ) {
            this.dragElement.parentNode.removeChild(this.dragElement);
         }
      }

      this._deactivateRegisteredDropZones();
      this.dragElement = null;
      this.currentDragObjectVisible = false;
   },

   _placeDraggableInDropZone: function(e) {
      var foundDropZone = false;
      var n = this.dropZones.length;
      for ( var i = 0 ; i < n ; i++ ) {
         if ( this._mousePointInDropZone( e, this.dropZones[i] ) ) {
            if ( this.dropZones[i].canAccept(this.currentDragObjects) ) {
               this.dropZones[i].hideHover();
               this.dropZones[i].accept(this.currentDragObjects);
               foundDropZone = true;
               break;
            }
         }
      }

      return foundDropZone;
   },

   _cancelDrag: function() {
      for ( var i = 0 ; i < this.currentDragObjects.length ; i++ )
         this.currentDragObjects[i].cancelDrag();
   },

   _endDrag: function() {
      for ( var i = 0 ; i < this.currentDragObjects.length ; i++ )
         this.currentDragObjects[i].endDrag();
   },

   _mousePointInDropZone: function( e, dropZone ) {

      var absoluteRect = dropZone.getAbsoluteRect();

      return e.clientX  > absoluteRect.left  &&
             e.clientX  < absoluteRect.right &&
             e.clientY  > absoluteRect.top   &&
             e.clientY  < absoluteRect.bottom;
   },

   _addMouseDownHandler: function( aDraggable )
   {
      var htmlElement = aDraggable.getMouseDownHTMLElement();
      if ( htmlElement != null ) {
         htmlElement.draggable = aDraggable;
         this._addMouseDownEvent( htmlElement );
      }
   },

   _activateRegisteredDropZones: function() {
      var n = this.dropZones.length;
      for ( var i = 0 ; i < n ; i++ ) {
         var dropZone = this.dropZones[i];
         if ( dropZone.canAccept(this.currentDragObjects) )
            dropZone.activate();
      }

      this.activatedDropZones = true;
   },

   _deactivateRegisteredDropZones: function() {
      var n = this.dropZones.length;
      for ( var i = 0 ; i < n ; i++ )
         this.dropZones[i].deactivate();
      this.activatedDropZones = false;
   },

   _addMouseDownEvent: function( htmlElement ) {
      if ( typeof document.implementation != "undefined" &&
         document.implementation.hasFeature("HTML",   "1.0") &&
         document.implementation.hasFeature("Events", "2.0") &&
         document.implementation.hasFeature("CSS",    "2.0") ) {
         htmlElement.addEventListener("mousedown", this._mouseDownHandler.bindAsEventListener(this), false);
      }
      else {
         htmlElement.attachEvent( "onmousedown", this._mouseDownHandler.bindAsEventListener(this) );
      }
   },

   _terminateEvent: function(e) {
      if ( e.stopPropagation != undefined )
         e.stopPropagation();
      else if ( e.cancelBubble != undefined )
         e.cancelBubble = true;

      if ( e.preventDefault != undefined )
         e.preventDefault();
      else
         e.returnValue = false;
   },

   initializeEventHandlers: function() {
      if ( typeof document.implementation != "undefined" &&
         document.implementation.hasFeature("HTML",   "1.0") &&
         document.implementation.hasFeature("Events", "2.0") &&
         document.implementation.hasFeature("CSS",    "2.0") ) {
         document.addEventListener("mouseup",   this._mouseUpHandler.bindAsEventListener(this),  false);
         document.addEventListener("mousemove", this._mouseMoveHandler.bindAsEventListener(this), false);
      }
      else {
         document.attachEvent( "onmouseup",   this._mouseUpHandler.bindAsEventListener(this) );
         document.attachEvent( "onmousemove", this._mouseMoveHandler.bindAsEventListener(this) );
      }
   }
}

//var dndMgr = new Rico.DragAndDrop();
//dndMgr.initializeEventHandlers();


//-------------------- ricoDraggable.js
Rico.Draggable = Class.create();

Rico.Draggable.prototype = {

   initialize: function( type, htmlElement ) {
      this.type          = type;
      this.htmlElement   = $(htmlElement);
      this.selected      = false;
   },

   /**
    *   Returns the HTML element that should have a mouse down event
    *   added to it in order to initiate a drag operation
    *
    **/
   getMouseDownHTMLElement: function() {
      return this.htmlElement;
   },

   select: function() {
      this.selected = true;

      if ( this.showingSelected )
         return;

      var htmlElement = this.getMouseDownHTMLElement();

      var color = Rico.Color.createColorFromBackground(htmlElement);
      color.isBright() ? color.darken(0.033) : color.brighten(0.033);

      this.saveBackground = RicoUtil.getElementsComputedStyle(htmlElement, "backgroundColor", "background-color");
      htmlElement.style.backgroundColor = color.asHex();
      this.showingSelected = true;
   },

   deselect: function() {
      this.selected = false;
      if ( !this.showingSelected )
         return;

      var htmlElement = this.getMouseDownHTMLElement();

      htmlElement.style.backgroundColor = this.saveBackground;
      this.showingSelected = false;
   },

   isSelected: function() {
      return this.selected;
   },

   startDrag: function() {
   },

   cancelDrag: function() {
   },

   endDrag: function() {
   },

   getSingleObjectDragGUI: function() {
      return this.htmlElement;
   },

   getMultiObjectDragGUI: function( draggables ) {
      return this.htmlElement;
   },

   getDroppedGUI: function() {
      return this.htmlElement;
   },

   toString: function() {
      return this.type + ":" + this.htmlElement + ":";
   }

}


//-------------------- ricoDropzone.js
Rico.Dropzone = Class.create();

Rico.Dropzone.prototype = {

   initialize: function( htmlElement ) {
      this.htmlElement  = $(htmlElement);
      this.absoluteRect = null;
   },

   getHTMLElement: function() {
      return this.htmlElement;
   },

   clearPositionCache: function() {
      this.absoluteRect = null;
   },

   getAbsoluteRect: function() {
      if ( this.absoluteRect == null ) {
         var htmlElement = this.getHTMLElement();
         var pos = RicoUtil.toViewportPosition(htmlElement);

         this.absoluteRect = {
            top:    pos.y,
            left:   pos.x,
            bottom: pos.y + htmlElement.offsetHeight,
            right:  pos.x + htmlElement.offsetWidth
         };
      }
      return this.absoluteRect;
   },

   activate: function() {
      var htmlElement = this.getHTMLElement();
      if (htmlElement == null  || this.showingActive)
         return;

      this.showingActive = true;
      this.saveBackgroundColor = htmlElement.style.backgroundColor;

      var fallbackColor = "#ffea84";
      var currentColor = Rico.Color.createColorFromBackground(htmlElement);
      if ( currentColor == null )
         htmlElement.style.backgroundColor = fallbackColor;
      else {
         currentColor.isBright() ? currentColor.darken(0.2) : currentColor.brighten(0.2);
         htmlElement.style.backgroundColor = currentColor.asHex();
      }
   },

   deactivate: function() {
      var htmlElement = this.getHTMLElement();
      if (htmlElement == null || !this.showingActive)
         return;

      htmlElement.style.backgroundColor = this.saveBackgroundColor;
      this.showingActive = false;
      this.saveBackgroundColor = null;
   },

   showHover: function() {
      var htmlElement = this.getHTMLElement();
      if ( htmlElement == null || this.showingHover )
         return;

      this.saveBorderWidth = htmlElement.style.borderWidth;
      this.saveBorderStyle = htmlElement.style.borderStyle;
      this.saveBorderColor = htmlElement.style.borderColor;

      this.showingHover = true;
      htmlElement.style.borderWidth = "1px";
      htmlElement.style.borderStyle = "solid";
      //htmlElement.style.borderColor = "#ff9900";
      htmlElement.style.borderColor = "#ffff00";
   },

   hideHover: function() {
      var htmlElement = this.getHTMLElement();
      if ( htmlElement == null || !this.showingHover )
         return;

      htmlElement.style.borderWidth = this.saveBorderWidth;
      htmlElement.style.borderStyle = this.saveBorderStyle;
      htmlElement.style.borderColor = this.saveBorderColor;
      this.showingHover = false;
   },

   canAccept: function(draggableObjects) {
      return true;
   },

   accept: function(draggableObjects) {
      var htmlElement = this.getHTMLElement();
      if ( htmlElement == null )
         return;

      n = draggableObjects.length;
      for ( var i = 0 ; i < n ; i++ )
      {
         var theGUI = draggableObjects[i].getDroppedGUI();
         if ( RicoUtil.getElementsComputedStyle( theGUI, "position" ) == "absolute" )
         {
            theGUI.style.position = "static";
            theGUI.style.top = "";
            theGUI.style.top = "";
         }
         htmlElement.appendChild(theGUI);
      }
   }
}


//-------------------- ricoEffects.js

/**
  *  Use the Effect namespace for effects.  If using scriptaculous effects
  *  this will already be defined, otherwise we'll just create an empty
  *  object for it...
 **/
if ( window.Effect == undefined )
   Effect = {};

Effect.SizeAndPosition = Class.create();
Effect.SizeAndPosition.prototype = {

   initialize: function(element, x, y, w, h, duration, steps, options) {
      this.element = $(element);
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.duration = duration;
      this.steps    = steps;
      this.options  = arguments[7] || {};

      this.sizeAndPosition();
   },

   sizeAndPosition: function() {
      if (this.isFinished()) {
         if(this.options.complete) this.options.complete(this);
         return;
      }

      if (this.timer)
         clearTimeout(this.timer);

      var stepDuration = Math.round(this.duration/this.steps) ;

      // Get original values: x,y = top left corner;  w,h = width height
      var currentX = this.element.offsetLeft;
      var currentY = this.element.offsetTop;
      var currentW = this.element.offsetWidth;
      var currentH = this.element.offsetHeight;

      // If values not set, or zero, we do not modify them, and take original as final as well
      this.x = (this.x) ? this.x : currentX;
      this.y = (this.y) ? this.y : currentY;
      this.w = (this.w) ? this.w : currentW;
      this.h = (this.h) ? this.h : currentH;

      // how much do we need to modify our values for each step?
      var difX = this.steps >  0 ? (this.x - currentX)/this.steps : 0;
      var difY = this.steps >  0 ? (this.y - currentY)/this.steps : 0;
      var difW = this.steps >  0 ? (this.w - currentW)/this.steps : 0;
      var difH = this.steps >  0 ? (this.h - currentH)/this.steps : 0;

      this.moveBy(difX, difY);
      this.resizeBy(difW, difH);

      this.duration -= stepDuration;
      this.steps--;

      this.timer = setTimeout(this.sizeAndPosition.bind(this), stepDuration);
   },

   isFinished: function() {
      return this.steps <= 0;
   },

   moveBy: function( difX, difY ) {
      var currentLeft = this.element.offsetLeft;
      var currentTop  = this.element.offsetTop;
      var intDifX     = parseInt(difX);
      var intDifY     = parseInt(difY);

      var style = this.element.style;
      if ( intDifX != 0 )
         style.left = (currentLeft + intDifX) + "px";
      if ( intDifY != 0 )
         style.top  = (currentTop + intDifY) + "px";
   },

   resizeBy: function( difW, difH ) {
      var currentWidth  = this.element.offsetWidth;
      var currentHeight = this.element.offsetHeight;
      var intDifW       = parseInt(difW);
      var intDifH       = parseInt(difH);

      var style = this.element.style;
      if ( intDifW != 0 )
         style.width   = (currentWidth  + intDifW) + "px";
      if ( intDifH != 0 )
         style.height  = (currentHeight + intDifH) + "px";
   }
}

Effect.Size = Class.create();
Effect.Size.prototype = {

   initialize: function(element, w, h, duration, steps, options) {
      new Effect.SizeAndPosition(element, null, null, w, h, duration, steps, options);
  }
}

Effect.Position = Class.create();
Effect.Position.prototype = {

   initialize: function(element, x, y, duration, steps, options) {
      new Effect.SizeAndPosition(element, x, y, null, null, duration, steps, options);
  }
}

Effect.Round = Class.create();
Effect.Round.prototype = {

   initialize: function(tagName, className, options) {
      var elements = document.getElementsByTagAndClassName(tagName,className);
      for ( var i = 0 ; i < elements.length ; i++ )
         Rico.Corner.round( elements[i], options );
   }
};

Effect.FadeTo = Class.create();
Effect.FadeTo.prototype = {

   initialize: function( element, opacity, duration, steps, options) {
      this.element  = $(element);
      this.opacity  = opacity;
      this.duration = duration;
      this.steps    = steps;
      this.options  = arguments[4] || {};
      this.fadeTo();
   },

   fadeTo: function() {
      if (this.isFinished()) {
         if(this.options.complete) this.options.complete(this);
         return;
      }

      if (this.timer)
         clearTimeout(this.timer);

      var stepDuration = Math.round(this.duration/this.steps) ;
      var currentOpacity = this.getElementOpacity();
      var delta = this.steps > 0 ? (this.opacity - currentOpacity)/this.steps : 0;

      this.changeOpacityBy(delta);
      this.duration -= stepDuration;
      this.steps--;

      this.timer = setTimeout(this.fadeTo.bind(this), stepDuration);
   },

   changeOpacityBy: function(v) {
      var currentOpacity = this.getElementOpacity();
      var newOpacity = Math.max(0, Math.min(currentOpacity+v, 1));
      this.element.ricoOpacity = newOpacity;

      this.element.style.filter = "alpha(opacity:"+Math.round(newOpacity*100)+")";
      this.element.style.opacity = newOpacity; /*//*/;
   },

   isFinished: function() {
      return this.steps <= 0;
   },

   getElementOpacity: function() {
      if ( this.element.ricoOpacity == undefined ) {
         var opacity;
         if ( this.element.currentStyle ) {
            opacity = this.element.currentStyle.opacity;
         }
         else if ( document.defaultView.getComputedStyle != undefined ) {
            var computedStyle = document.defaultView.getComputedStyle;
            opacity = computedStyle(this.element, null).getPropertyValue('opacity');
         }

         this.element.ricoOpacity = opacity != undefined ? opacity : 1.0;
      }

      return parseFloat(this.element.ricoOpacity);
   }
}

Effect.AccordionSize = Class.create();

Effect.AccordionSize.prototype = {

   initialize: function(e1, e2, start, end, duration, steps, options) {
      this.e1       = $(e1);
      this.e2       = $(e2);
      this.start    = start;
      this.end      = end;
      this.duration = duration;
      this.steps    = steps;
      this.options  = arguments[6] || {};

      this.accordionSize();
   },

   accordionSize: function() {

      if (this.isFinished()) {
         // just in case there are round errors or such...
         this.e1.style.height = this.start + "px";
         this.e2.style.height = this.end + "px";

         if(this.options.complete)
            this.options.complete(this);
         return;
      }

      if (this.timer)
         clearTimeout(this.timer);

      var stepDuration = Math.round(this.duration/this.steps) ;

      var diff = this.steps > 0 ? (parseInt(this.e1.offsetHeight) - this.start)/this.steps : 0;
      this.resizeBy(diff);

      this.duration -= stepDuration;
      this.steps--;

      this.timer = setTimeout(this.accordionSize.bind(this), stepDuration);
   },

   isFinished: function() {
      return this.steps <= 0;
   },

   resizeBy: function(diff) {
      var h1Height = this.e1.offsetHeight;
      var h2Height = this.e2.offsetHeight;
      var intDiff = parseInt(diff);
      if ( diff != 0 ) {
         this.e1.style.height = (h1Height - intDiff) + "px";
         this.e2.style.height = (h2Height + intDiff) + "px";
      }
   }

};


//-------------------- ricoLiveGrid.js

// Rico.LiveGridMetaData -----------------------------------------------------

Rico.LiveGridMetaData = Class.create();

Rico.LiveGridMetaData.prototype = {

   initialize: function( pageSize, totalRows, columnCount, options ) {
      this.pageSize  = pageSize;
      this.totalRows = totalRows;
      this.setOptions(options);
      this.scrollArrowHeight = 16;
      this.columnCount = columnCount;
   },

   setOptions: function(options) {
      this.options = {
         largeBufferSize    : 7.0,   // 7 pages
         nearLimitFactor    : 0.2    // 20% of buffer
      }.extend(options || {});
   },

   getPageSize: function() {
      return this.pageSize;
   },

   getTotalRows: function() {
      return this.totalRows;
   },

   setTotalRows: function(n) {
      this.totalRows = n;
   },

   getLargeBufferSize: function() {
      return parseInt(this.options.largeBufferSize * this.pageSize);
   },

   getLimitTolerance: function() {
      return parseInt(this.getLargeBufferSize() * this.options.nearLimitFactor);
   }
};

// Rico.LiveGridScroller -----------------------------------------------------

Rico.LiveGridScroller = Class.create();

Rico.LiveGridScroller.prototype = {

   initialize: function(liveGrid, viewPort) {
      this.isIE = navigator.userAgent.toLowerCase().indexOf("msie") >= 0;
      this.liveGrid = liveGrid;
      this.metaData = liveGrid.metaData;
      this.createScrollBar();
      this.scrollTimeout = null;
      this.lastScrollPos = 0;
      this.viewPort = viewPort;
      this.rows = new Array();
   },

   isUnPlugged: function() {
      return this.scrollerDiv.onscroll == null;
   },

   plugin: function() {
      this.scrollerDiv.onscroll = this.handleScroll.bindAsEventListener(this);
   },

   unplug: function() {
      this.scrollerDiv.onscroll = null;
   },

   sizeIEHeaderHack: function() {
      if ( !this.isIE ) return;
      var headerTable = $(this.liveGrid.tableId + "_header");
      if ( headerTable )
         headerTable.rows[0].cells[0].style.width =
            (headerTable.rows[0].cells[0].offsetWidth + 1) + "px";
   },

   createScrollBar: function() {
      var visibleHeight = this.liveGrid.viewPort.visibleHeight();
      // create the outer div...
      this.scrollerDiv  = document.createElement("div");
      var scrollerStyle = this.scrollerDiv.style;
      scrollerStyle.borderRight = "1px solid #ababab"; // hard coded color!!!
      scrollerStyle.position    = "relative";
      scrollerStyle.left        = this.isIE ? "-6px" : "-3px";
      scrollerStyle.width       = "19px";
      scrollerStyle.height      = visibleHeight + "px";
      scrollerStyle.overflow    = "auto";

      // create the inner div...
      this.heightDiv = document.createElement("div");
      this.heightDiv.style.width  = "1px";

      this.heightDiv.style.height = parseInt(visibleHeight *
                        this.metaData.getTotalRows()/this.metaData.getPageSize()) + "px" ;
      this.scrollerDiv.appendChild(this.heightDiv);
      this.scrollerDiv.onscroll = this.handleScroll.bindAsEventListener(this);

     var table = this.liveGrid.table;
     table.parentNode.parentNode.insertBefore( this.scrollerDiv, table.parentNode.nextSibling );
   },

   updateSize: function() {
      var table = this.liveGrid.table;
      var visibleHeight = this.viewPort.visibleHeight();
      this.heightDiv.style.height = parseInt(visibleHeight *
                                  this.metaData.getTotalRows()/this.metaData.getPageSize()) + "px";
   },

   rowToPixel: function(rowOffset) {
      return (rowOffset / this.metaData.getTotalRows()) * this.heightDiv.offsetHeight
   },
   
   moveScroll: function(rowOffset) {
      this.scrollerDiv.scrollTop = this.rowToPixel(rowOffset);
      if ( this.metaData.options.onscroll )
         this.metaData.options.onscroll( this.liveGrid, rowOffset );    
   },

   handleScroll: function() {
     if ( this.scrollTimeout )
         clearTimeout( this.scrollTimeout );

      var contentOffset = parseInt(this.scrollerDiv.scrollTop / this.viewPort.rowHeight);
      this.liveGrid.requestContentRefresh(contentOffset);
      this.viewPort.scrollTo(this.scrollerDiv.scrollTop);
      
      if ( this.metaData.options.onscroll )
         this.metaData.options.onscroll( this.liveGrid, contentOffset );

      this.scrollTimeout = setTimeout( this.scrollIdle.bind(this), 1200 );
   },

   scrollIdle: function() {
      if ( this.metaData.options.onscrollidle )
         this.metaData.options.onscrollidle();
   }
};

// Rico.LiveGridBuffer -----------------------------------------------------

Rico.LiveGridBuffer = Class.create();

Rico.LiveGridBuffer.prototype = {

   initialize: function(metaData, viewPort) {
      this.startPos = 0;
      this.size     = 0;
      this.metaData = metaData;
      this.rows     = new Array();
      this.updateInProgress = false;
      this.viewPort = viewPort;
      this.maxBufferSize = metaData.getLargeBufferSize() * 2;
      this.maxFetchSize = metaData.getLargeBufferSize();
      this.lastOffset = 0;
   },

   getBlankRow: function() {
      if (!this.blankRow ) {
         this.blankRow = new Array();
         for ( var i=0; i < this.metaData.columnCount ; i++ ) 
            this.blankRow[i] = "&nbsp;";
     }
     return this.blankRow;
   },
   
   loadRows: function(ajaxResponse) {
      var rowsElement = ajaxResponse.getElementsByTagName('rows')[0];
      this.updateUI = rowsElement.getAttribute("update_ui") == "true"
      var newRows = new Array()
      var trs = rowsElement.getElementsByTagName("tr");
      for ( var i=0 ; i < trs.length; i++ ) {
         var row = newRows[i] = new Array(); 
         var cells = trs[i].getElementsByTagName("td");
         for ( var j=0; j < cells.length ; j++ ) {
            var cell = cells[j];
            var convertSpaces = cell.getAttribute("convert_spaces") == "true";
            var cellContent = RicoUtil.getContentAsString(cell);
            row[j] = convertSpaces ? this.convertSpaces(cellContent) : cellContent;
            if (!row[j]) 
               row[j] = '&nbsp;';
         }
      }
      return newRows;
   },
      
   update: function(ajaxResponse, start) {
     var newRows = this.loadRows(ajaxResponse);
      if (this.rows.length == 0) { // initial load
         this.rows = newRows;
         this.size = this.rows.length;
         this.startPos = start;
         return;
      }
      if (start > this.startPos) { //appending
         if (this.startPos + this.rows.length < start) {
            this.rows =  newRows;
            this.startPos = start;//
         } else {
              this.rows = this.rows.concat( newRows.slice(0, newRows.length));
            if (this.rows.length > this.maxBufferSize) {
               var fullSize = this.rows.length;
               this.rows = this.rows.slice(this.rows.length - this.maxBufferSize, this.rows.length)
               this.startPos = this.startPos +  (fullSize - this.rows.length);
            }
         }
      } else { //prepending
         if (start + newRows.length < this.startPos) {
            this.rows =  newRows;
         } else {
            this.rows = newRows.slice(0, this.startPos).concat(this.rows);
            if (this.rows.length > this.maxBufferSize) 
               this.rows = this.rows.slice(0, this.maxBufferSize)
         }
         this.startPos =  start;
      }
      this.size = this.rows.length;
   },
   
   clear: function() {
      this.rows = new Array();
      this.startPos = 0;
      this.size = 0;
   },

   isOverlapping: function(start, size) {
      return ((start < this.endPos()) && (this.startPos < start + size)) || (this.endPos() == 0)
   },

   isInRange: function(position) {
      return (position >= this.startPos) && (position + this.metaData.getPageSize() <= this.endPos()); 
             //&& this.size()  != 0;
   },

   isNearingTopLimit: function(position) {
      return position - this.startPos < this.metaData.getLimitTolerance();
   },

   endPos: function() {
      return this.startPos + this.rows.length;
   },
   
   isNearingBottomLimit: function(position) {
      return this.endPos() - (position + this.metaData.getPageSize()) < this.metaData.getLimitTolerance();
   },

   isAtTop: function() {
      return this.startPos == 0;
   },

   isAtBottom: function() {
      return this.endPos() == this.metaData.getTotalRows();
   },

   isNearingLimit: function(position) {
      return ( !this.isAtTop()    && this.isNearingTopLimit(position)) ||
             ( !this.isAtBottom() && this.isNearingBottomLimit(position) )
   },

   getFetchSize: function(offset) {
      var adjustedOffset = this.getFetchOffset(offset);
      var adjustedSize = 0;
      if (adjustedOffset >= this.startPos) { //apending
         var endFetchOffset = this.maxFetchSize  + adjustedOffset;
         if (endFetchOffset > this.metaData.totalRows)
            endFetchOffset = this.metaData.totalRows;
         adjustedSize = endFetchOffset - adjustedOffset;   
      } else {//prepending
         var adjustedSize = this.startPos - adjustedOffset;
         if (adjustedSize > this.maxFetchSize)
            adjustedSize = this.maxFetchSize;
      }
      return adjustedSize;
   }, 

   getFetchOffset: function(offset) {
      var adjustedOffset = offset;
      if (offset > this.startPos)  //apending
         adjustedOffset = (offset > this.endPos()) ? offset :  this.endPos(); 
      else { //prepending
         if (offset + this.maxFetchSize >= this.startPos) {
            var adjustedOffset = this.startPos - this.maxFetchSize;
            if (adjustedOffset < 0)
               adjustedOffset = 0;
         }
      }
      this.lastOffset = adjustedOffset;
      return adjustedOffset;
   },

   getRows: function(start, count) {
      var begPos = start - this.startPos
      var endPos = begPos + count

      // er? need more data...
      if ( endPos > this.size )
         endPos = this.size

      var results = new Array()
      var index = 0;
      for ( var i=begPos ; i < endPos; i++ ) {
         results[index++] = this.rows[i]
      }
      return results
   },

   convertSpaces: function(s) {
      return s.split(" ").join("&nbsp;");
   }

};


//Rico.GridViewPort --------------------------------------------------
Rico.GridViewPort = Class.create();

Rico.GridViewPort.prototype = {

   initialize: function(table, rowHeight, visibleRows, buffer, liveGrid) {
      this.lastDisplayedStartPos = 0;
      this.div = table.parentNode;
      this.table = table
      this.rowHeight = rowHeight;
      this.div.style.height = this.rowHeight * visibleRows;
      this.div.style.overflow = "hidden";
      this.buffer = buffer;
      this.liveGrid = liveGrid;
      this.visibleRows = visibleRows + 1;
      this.lastPixelOffset = 0;
      this.startPos = 0;
   },

   populateRow: function(htmlRow, row) {
      for (var j=0; j < row.length; j++) {
         htmlRow.cells[j].innerHTML = row[j]
      }
   },
   
   bufferChanged: function() {
      this.refreshContents( parseInt(this.lastPixelOffset / this.rowHeight));
   },
   
   clearRows: function() {
      if (!this.isBlank) {
         for (var i=0; i < this.visibleRows; i++)
            this.populateRow(this.table.rows[i], this.buffer.getBlankRow());
         this.isBlank = true;
      }
   },
   
   clearContents: function() {   
      this.clearRows();
      this.scrollTo(0);
      this.startPos = 0;
      this.lastStartPos = -1;   
   },
   
   refreshContents: function(startPos) {
      if (startPos == this.lastRowPos && !this.isPartialBlank && !this.isBlank) {
         return;
      }
      if ((startPos + this.visibleRows < this.buffer.startPos)  
          || (this.buffer.startPos + this.buffer.size < startPos) 
          || (this.buffer.size == 0)) {
         this.clearRows();
         return;
      }
      this.isBlank = false;
      var viewPrecedesBuffer = this.buffer.startPos > startPos
      var contentStartPos = viewPrecedesBuffer ? this.buffer.startPos: startPos;
   
      var contentEndPos = (this.buffer.startPos + this.buffer.size < startPos + this.visibleRows) 
                                 ? this.buffer.startPos + this.buffer.size
                                 : startPos + this.visibleRows;       
      var rowSize = contentEndPos - contentStartPos;
      var rows = this.buffer.getRows(contentStartPos, rowSize ); 
      var blankSize = this.visibleRows - rowSize;
      var blankOffset = viewPrecedesBuffer ? 0: rowSize;
      var contentOffset = viewPrecedesBuffer ? blankSize: 0;

      for (var i=0; i < rows.length; i++) {//initialize what we have
        this.populateRow(this.table.rows[i + contentOffset], rows[i]);
      }       
      for (var i=0; i < blankSize; i++) {// blank out the rest 
        this.populateRow(this.table.rows[i + blankOffset], this.buffer.getBlankRow());
      }
      this.isPartialBlank = blankSize > 0;
      this.lastRowPos = startPos;   
   },

   scrollTo: function(pixelOffset) {      
      if (this.lastPixelOffset == pixelOffset)
         return;

      this.refreshContents(parseInt(pixelOffset / this.rowHeight))
      this.div.scrollTop = pixelOffset % this.rowHeight        
      
      this.lastPixelOffset = pixelOffset;
   },
   
   visibleHeight: function() {
      return parseInt(this.div.style.height);
   }
   
};


Rico.LiveGridRequest = Class.create();
Rico.LiveGridRequest.prototype = {
   initialize: function( requestOffset, options ) {
      this.requestOffset = requestOffset;
   }
};

// Rico.LiveGrid -----------------------------------------------------

Rico.LiveGrid = Class.create();

Rico.LiveGrid.prototype = {

   initialize: function( tableId, visibleRows, totalRows, url, options ) {
      if ( options == null )
         options = {};

      this.tableId     = tableId; 
      this.table       = $(tableId);
      var columnCount  = this.table.rows[0].cells.length
      this.metaData    = new Rico.LiveGridMetaData(visibleRows, totalRows, columnCount, options);
      this.buffer      = new Rico.LiveGridBuffer(this.metaData);

      var rowCount = this.table.rows.length;
      this.viewPort =  new Rico.GridViewPort(this.table, 
                                            this.table.offsetHeight/rowCount,
                                            visibleRows,
                                            this.buffer, this);
      this.scroller    = new Rico.LiveGridScroller(this,this.viewPort);
      
      this.additionalParms       = options.requestParameters || [];
      
      options.sortHandler = this.sortHandler.bind(this);

      if ( $(tableId + '_header') )
         this.sort = new Rico.LiveGridSort(tableId + '_header', options)

      this.processingRequest = null;
      this.unprocessedRequest = null;

      this.initAjax(url);
      if ( options.prefetchBuffer || options.prefetchOffset > 0) {
         var offset = 0;
         if (options.offset ) {
            offset = options.offset;            
            this.scroller.moveScroll(offset);
            this.viewPort.scrollTo(this.scroller.rowToPixel(offset));            
         }
         if (options.sortCol) {
             this.sortCol = options.sortCol;
             this.sortDir = options.sortDir;
         }
         this.requestContentRefresh(offset);
      }
   },

   resetContents: function() {
      this.scroller.moveScroll(0);
      this.buffer.clear();
      this.viewPort.clearContents();
   },
   
   sortHandler: function(column) {
      this.sortCol = column.name;
      this.sortDir = column.currentSort;

      this.resetContents();
      this.requestContentRefresh(0) 
   },
   
   setRequestParams: function() {
      this.additionalParms = [];
      for ( var i=0 ; i < arguments.length ; i++ )
         this.additionalParms[i] = arguments[i];
   },

   setTotalRows: function( newTotalRows ) {
      this.resetContents();
      this.metaData.setTotalRows(newTotalRows);
      this.scroller.updateSize();
   },

   initAjax: function(url) {
      ajaxEngine.registerRequest( this.tableId + '_request', url );
      ajaxEngine.registerAjaxObject( this.tableId + '_updater', this );
   },

   invokeAjax: function() {
   },

   handleTimedOut: function() {
      //server did not respond in 4 seconds... assume that there could have been
      //an error or something, and allow requests to be processed again...
      this.processingRequest = null;
      this.processQueuedRequest();
   },

   fetchBuffer: function(offset) {
      if ( this.buffer.isInRange(offset) &&
         !this.buffer.isNearingLimit(offset)) {
         return;
      }
      if (this.processingRequest) {
          this.unprocessedRequest = new Rico.LiveGridRequest(offset);
         return;
      }
      var bufferStartPos = this.buffer.getFetchOffset(offset);
      this.processingRequest = new Rico.LiveGridRequest(offset);
      this.processingRequest.bufferOffset = bufferStartPos;   
      var fetchSize = this.buffer.getFetchSize(offset);
      var partialLoaded = false;
      var callParms = []; 
      callParms.push(this.tableId + '_request');
      callParms.push('id='        + this.tableId);
      callParms.push('page_size=' + fetchSize);
      callParms.push('offset='    + bufferStartPos);
      if ( this.sortCol) {
         callParms.push('sort_col='    + this.sortCol);
         callParms.push('sort_dir='    + this.sortDir);
      }
      
      for( var i=0 ; i < this.additionalParms.length ; i++ )
         callParms.push(this.additionalParms[i]);
      ajaxEngine.sendRequest.apply( ajaxEngine, callParms );
        
      this.timeoutHandler = setTimeout( this.handleTimedOut.bind(this), 20000 ); //todo: make as option
   },

   requestContentRefresh: function(contentOffset) {
      this.fetchBuffer(contentOffset);
   },

   ajaxUpdate: function(ajaxResponse) {
      try {
         clearTimeout( this.timeoutHandler );
         this.buffer.update(ajaxResponse,this.processingRequest.bufferOffset);
         this.viewPort.bufferChanged();
      }
      catch(err) {}
      finally {this.processingRequest = null; }
      this.processQueuedRequest();
   },

   processQueuedRequest: function() {
      if (this.unprocessedRequest != null) {
         this.requestContentRefresh(this.unprocessedRequest.requestOffset);
         this.unprocessedRequest = null
      }  
   }
 
};


//-------------------- ricoLiveGridSort.js
Rico.LiveGridSort = Class.create();

Rico.LiveGridSort.prototype = {

   initialize: function(headerTableId, options) {
      this.headerTableId = headerTableId;
      this.headerTable   = $(headerTableId);
      this.setOptions(options);
      this.applySortBehavior();

      if ( this.options.sortCol ) {
         this.setSortUI( this.options.sortCol, this.options.sortDir );
      }
   },

   setSortUI: function( columnName, sortDirection ) {
      var cols = this.options.columns;
      for ( var i = 0 ; i < cols.length ; i++ ) {
         if ( cols[i].name == columnName ) {
            this.setColumnSort(i, sortDirection);
            break;
         }
      }
   },

   setOptions: function(options) {
      this.options = {
         sortAscendImg:    'images/sort_asc.gif',
         sortDescendImg:   'images/sort_desc.gif',
         imageWidth:       9,
         imageHeight:      5,
         ajaxSortURLParms: []
      }.extend(options);

      // preload the images...
      new Image().src = this.options.sortAscendImg;
      new Image().src = this.options.sortDescendImg;

      this.sort = options.sortHandler;
      if ( !this.options.columns )
         this.options.columns = this.introspectForColumnInfo();
      else {
         // allow client to pass { columns: [ ["a", true], ["b", false] ] }
         // and convert to an array of Rico.TableColumn objs...
         this.options.columns = this.convertToTableColumns(this.options.columns);
      }
   },

   applySortBehavior: function() {
      var headerRow   = this.headerTable.rows[0];
      var headerCells = headerRow.cells;
      for ( var i = 0 ; i < headerCells.length ; i++ ) {
         this.addSortBehaviorToColumn( i, headerCells[i] );
      }
   },

   addSortBehaviorToColumn: function( n, cell ) {
      if ( this.options.columns[n].isSortable() ) {
         cell.id            = this.headerTableId + '_' + n;
         cell.style.cursor  = 'pointer';
         cell.onclick       = this.headerCellClicked.bindAsEventListener(this);
         cell.innerHTML     = cell.innerHTML + '<span id="' + this.headerTableId + '_img_' + n + '">'
                           + '&nbsp;&nbsp;&nbsp;</span>';
      }
   },

   // event handler....
   headerCellClicked: function(evt) {
      var eventTarget = evt.target ? evt.target : evt.srcElement;
      var cellId = eventTarget.id;
      var columnNumber = parseInt(cellId.substring( cellId.lastIndexOf('_') + 1 ));
      var sortedColumnIndex = this.getSortedColumnIndex();
      if ( sortedColumnIndex != -1 ) {
         if ( sortedColumnIndex != columnNumber ) {
            this.removeColumnSort(sortedColumnIndex);
            this.setColumnSort(columnNumber, Rico.TableColumn.SORT_ASC);
         }
         else
            this.toggleColumnSort(sortedColumnIndex);
      }
      else
         this.setColumnSort(columnNumber, Rico.TableColumn.SORT_ASC);

      if (this.options.sortHandler) {
         this.options.sortHandler(this.options.columns[columnNumber]);
      }
   },

   removeColumnSort: function(n) {
      this.options.columns[n].setUnsorted();
      this.setSortImage(n);
   },

   setColumnSort: function(n, direction) {
      this.options.columns[n].setSorted(direction);
      this.setSortImage(n);
   },

   toggleColumnSort: function(n) {
      this.options.columns[n].toggleSort();
      this.setSortImage(n);
   },

   setSortImage: function(n) {
      var sortDirection = this.options.columns[n].getSortDirection();

      var sortImageSpan = $( this.headerTableId + '_img_' + n );
      if ( sortDirection == Rico.TableColumn.UNSORTED )
         sortImageSpan.innerHTML = '&nbsp;&nbsp;';
      else if ( sortDirection == Rico.TableColumn.SORT_ASC )
         sortImageSpan.innerHTML = '&nbsp;&nbsp;<img width="'  + this.options.imageWidth    + '" ' +
                                                     'height="'+ this.options.imageHeight   + '" ' +
                                                     'src="'   + this.options.sortAscendImg + '"/>';
      else if ( sortDirection == Rico.TableColumn.SORT_DESC )
         sortImageSpan.innerHTML = '&nbsp;&nbsp;<img width="'  + this.options.imageWidth    + '" ' +
                                                     'height="'+ this.options.imageHeight   + '" ' +
                                                     'src="'   + this.options.sortDescendImg + '"/>';
   },

   getSortedColumnIndex: function() {
      var cols = this.options.columns;
      for ( var i = 0 ; i < cols.length ; i++ ) {
         if ( cols[i].isSorted() )
            return i;
      }

      return -1;
   },

   introspectForColumnInfo: function() {
      var columns = new Array();
      var headerRow   = this.headerTable.rows[0];
      var headerCells = headerRow.cells;
      for ( var i = 0 ; i < headerCells.length ; i++ )
         columns.push( new Rico.TableColumn( this.deriveColumnNameFromCell(headerCells[i],i), true ) );
      return columns;
   },

   convertToTableColumns: function(cols) {
      var columns = new Array();
      for ( var i = 0 ; i < cols.length ; i++ )
         columns.push( new Rico.TableColumn( cols[i][0], cols[i][1] ) );
   },

   deriveColumnNameFromCell: function(cell,columnNumber) {
      var cellContent = cell.innerText != undefined ? cell.innerText : cell.textContent;
      return cellContent ? cellContent.toLowerCase().split(' ').join('_') : "col_" + columnNumber;
   }
};

Rico.TableColumn = Class.create();

Rico.TableColumn.UNSORTED  = 0;
Rico.TableColumn.SORT_ASC  = "ASC";
Rico.TableColumn.SORT_DESC = "DESC";

Rico.TableColumn.prototype = {
   initialize: function(name, sortable) {
      this.name        = name;
      this.sortable    = sortable;
      this.currentSort = Rico.TableColumn.UNSORTED;
   },

   isSortable: function() {
      return this.sortable;
   },

   isSorted: function() {
      return this.currentSort != Rico.TableColumn.UNSORTED;
   },

   getSortDirection: function() {
      return this.currentSort;
   },

   toggleSort: function() {
      if ( this.currentSort == Rico.TableColumn.UNSORTED || this.currentSort == Rico.TableColumn.SORT_DESC )
         this.currentSort = Rico.TableColumn.SORT_ASC;
      else if ( this.currentSort == Rico.TableColumn.SORT_ASC )
         this.currentSort = Rico.TableColumn.SORT_DESC;
   },

   setUnsorted: function(direction) {
      this.setSorted(Rico.TableColumn.UNSORTED);
   },

   setSorted: function(direction) {
      // direction must by one of Rico.TableColumn.UNSORTED, .SORT_ASC, or .SET_DESC...
      this.currentSort = direction;
   }

};


//-------------------- ricoUtil.js

var RicoUtil = {

   getElementsComputedStyle: function ( htmlElement, cssProperty, mozillaEquivalentCSS) {
      if ( arguments.length == 2 )
         mozillaEquivalentCSS = cssProperty;

      var el = $(htmlElement);
      if ( el.currentStyle )
         return el.currentStyle[cssProperty];
      else
         return document.defaultView.getComputedStyle(el, null).getPropertyValue(mozillaEquivalentCSS);
   },

   createXmlDocument : function() {
      if (document.implementation && document.implementation.createDocument) {
         var doc = document.implementation.createDocument("", "", null);

         if (doc.readyState == null) {
            doc.readyState = 1;
            doc.addEventListener("load", function () {
               doc.readyState = 4;
               if (typeof doc.onreadystatechange == "function")
                  doc.onreadystatechange();
            }, false);
         }

         return doc;
      }

      if (window.ActiveXObject)
          return Try.these(
            function() { return new ActiveXObject('MSXML2.DomDocument')   },
            function() { return new ActiveXObject('Microsoft.DomDocument')},
            function() { return new ActiveXObject('MSXML.DomDocument')    },
            function() { return new ActiveXObject('MSXML3.DomDocument')   }
          ) || false;

      return null;
   },

   getContentAsString: function( parentNode ) {
      return parentNode.xml != undefined ? 
         this._getContentAsStringIE(parentNode) :
         this._getContentAsStringMozilla(parentNode);
   },

   _getContentAsStringIE: function(parentNode) {
      var contentStr = "";
      for ( var i = 0 ; i < parentNode.childNodes.length ; i++ )
         contentStr += parentNode.childNodes[i].xml;
      return contentStr;
   },

   _getContentAsStringMozilla: function(parentNode) {
      var xmlSerializer = new XMLSerializer();
      var contentStr = "";
      for ( var i = 0 ; i < parentNode.childNodes.length ; i++ )
         contentStr += xmlSerializer.serializeToString(parentNode.childNodes[i]);
      return contentStr;
   },

   toViewportPosition: function(element) {
      return this._toAbsolute(element,true);
   },

   toDocumentPosition: function(element) {
      return this._toAbsolute(element,false);
   },

   /**
    *  Compute the elements position in terms of the window viewport
    *  so that it can be compared to the position of the mouse (dnd)
    *  This is additions of all the offsetTop,offsetLeft values up the
    *  offsetParent hierarchy, ...taking into account any scrollTop,
    *  scrollLeft values along the way...
    *
    * IE has a bug reporting a correct offsetLeft of elements within a
    * a relatively positioned parent!!!
    **/
   _toAbsolute: function(element,accountForDocScroll) {

      if ( navigator.userAgent.toLowerCase().indexOf("msie") == -1 )
         return this._toAbsoluteMozilla(element,accountForDocScroll);

      var x = 0;
      var y = 0;
      var parent = element;
      while ( parent ) {

         var borderXOffset = 0;
         var borderYOffset = 0;
         if ( parent != element ) {
            var borderXOffset = parseInt(this.getElementsComputedStyle(parent, "borderLeftWidth" ));
            var borderYOffset = parseInt(this.getElementsComputedStyle(parent, "borderTopWidth" ));
            borderXOffset = isNaN(borderXOffset) ? 0 : borderXOffset;
            borderYOffset = isNaN(borderYOffset) ? 0 : borderYOffset;
         }

         x += parent.offsetLeft - parent.scrollLeft + borderXOffset;
         y += parent.offsetTop - parent.scrollTop + borderYOffset;
         parent = parent.offsetParent;
      }

      if ( accountForDocScroll ) {
         x -= this.docScrollLeft();
         y -= this.docScrollTop();
      }

      return { x:x, y:y };
   },

   /**
    *  Mozilla did not report all of the parents up the hierarchy via the
    *  offsetParent property that IE did.  So for the calculation of the
    *  offsets we use the offsetParent property, but for the calculation of
    *  the scrollTop/scrollLeft adjustments we navigate up via the parentNode
    *  property instead so as to get the scroll offsets...
    *
    **/
   _toAbsoluteMozilla: function(element,accountForDocScroll) {
      var x = 0;
      var y = 0;
      var parent = element;
      while ( parent ) {
         x += parent.offsetLeft;
         y += parent.offsetTop;
         parent = parent.offsetParent;
      }

      parent = element;
      while ( parent &&
              parent != document.body &&
              parent != document.documentElement ) {
         if ( parent.scrollLeft  )
            x -= parent.scrollLeft;
         if ( parent.scrollTop )
            y -= parent.scrollTop;
         parent = parent.parentNode;
      }

      if ( accountForDocScroll ) {
         x -= this.docScrollLeft();
         y -= this.docScrollTop();
      }

      return { x:x, y:y };
   },

   docScrollLeft: function() {
      if ( window.pageXOffset )
         return window.pageXOffset;
      else if ( document.documentElement && document.documentElement.scrollLeft )
         return document.documentElement.scrollLeft;
      else if ( document.body )
         return document.body.scrollLeft;
      else
         return 0;
   },

   docScrollTop: function() {
      if ( window.pageYOffset )
         return window.pageYOffset;
      else if ( document.documentElement && document.documentElement.scrollTop )
         return document.documentElement.scrollTop;
      else if ( document.body )
         return document.body.scrollTop;
      else
         return 0;
   }

};
