/**
 * @fileoverview
 * 
 * ECMAScript <a href="http://www.carto.net/papers/svg/resources/helper_functions.html">helper functions</a>, main purpose is to serve in SVG mapping or other SVG based web applications
 *
 * This ECMA script library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library (http://www.carto.net/papers/svg/resources/lesser_gpl.txt); if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 * Please report bugs and send improvements to neumann@karto.baug.ethz.ch
 * If you use these scripts, please link to the original (http://www.carto.net/papers/svg/resources/helper_functions.html)
 * somewhere in the source-code-comment or the "about" of your project and give credits, thanks!
 * 
 * See <a href="js_docs_out/overview-summary-helper_functions.js.html">documentation</a>. 
 * 
 * @author Andreas Neumann a.neumann@carto.net
 * @copyright LGPL 2.1 <a href="http://www.gnu.org/copyleft/lesser.txt">Gnu LGPL 2.1</a>
 * @credits Bruce Rindahl, numerous people on svgdevelopers@yahoogroups.com
 */

//global variables necessary to create elements in these namespaces, do not delete them!!!!

/**
 * This variable is a shortcut to the full URL of the SVG namespace
 * @final
 * @type String
 */
var svgNS = "http://www.w3.org/2000/svg";

/**
 * This variable is a shortcut to the full URL of the XLink namespace
 * @final
 * @type String
 */
var xlinkNS = "http://www.w3.org/1999/xlink";

/**
 * This variable is a shortcut to the full URL of the attrib namespace
 * @final
 * @type String
 */
var cartoNS = "http://www.carto.net/attrib";

/**
 * This variable is a alias to the full URL of the attrib namespace
 * @final
 * @type String
 */
var attribNS = "http://www.carto.net/attrib";

/**
 * This variable is a alias to the full URL of the Batik extension namespace
 * @final
 * @type String
 */
var batikNS = "http://xml.apache.org/batik/ext";

/**
 * Returns the polar direction from a given vector
 * @param {Number} xdiff	the x-part of the vector
 * @param {Number} ydiff	the y-part of the vector
 * @return direction		the direction in radians
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #toPolarDist
 * @see #toRectX
 * @see #toRectY
 */
function toPolarDir(xdiff,ydiff) {
   var direction = (Math.atan2(ydiff,xdiff));
   return(direction);
}

/**
 * Returns the polar distance from a given vector
 * @param {Number} xdiff	the x-part of the vector
 * @param {Number} ydiff	the y-part of the vector
 * @return distance			the distance
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #toPolarDir
 * @see #toRectX
 * @see #toRectY
 */
function toPolarDist(xdiff,ydiff) {
   var distance = Math.sqrt(xdiff * xdiff + ydiff * ydiff);
   return(distance);
}

/**
 * Returns the x-part of a vector from a given direction and distance
 * @param {Number} direction	the direction (in radians)
 * @param {Number} distance		the distance
 * @return x					the x-part of the vector
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #toPolarDist
 * @see #toPolarDir
 * @see #toRectY
 */
function toRectX(direction,distance) {
   var x = distance * Math.cos(direction);
   return(x);
}

/**
 * Returns the y-part of the vector from a given direction and distance
 * @param {Number} direction	the direction (in radians)
 * @param {Number} distance		the distance
 * @return y					the y-part of the vector
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #toPolarDist
 * @see #toPolarDir
 * @see #toRectX
 */
function toRectY(direction,distance) {
   y = distance * Math.sin(direction);
   return(y);
}

/**
 * Converts degrees to radians
 * @param {Number} deg	the degree value
 * @return rad			the radians value
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #RadToDeg
 */
function DegToRad(deg) {
     return (deg / 180.0 * Math.PI);
}

/**
 * Converts radians to degrees
 * @param {Number} rad	the radians value
 * @return deg			the degree value
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #DegToRad
 */
function RadToDeg(rad) {
     return (rad / Math.PI * 180.0);
}

/**
 * Converts decimal degrees to degrees, minutes, seconds
 * @param {Number} dd	the decimal degree value
 * @return degrees		the degree values in the following notation: {deg:degrees,min:minutes,sec:seconds}
 * @type literal
 * @version 1.0 (2007-04-30)
 * @see #dms2dd
 */
function dd2dms(dd) {
        var minutes = (Math.abs(dd) - Math.floor(Math.abs(dd))) * 60;
        var seconds = (minutes - Math.floor(minutes)) * 60;
        var minutes = Math.floor(minutes);
        if (dd >= 0) {
            var degrees = Math.floor(dd);
        }
        else {
            var degrees = Math.ceil(dd);       
        }
        return {deg:degrees,min:minutes,sec:seconds};
}

/**
 * Converts degrees, minutes and seconds to decimal degrees
 * @param {Number} deg	the degree value
 * @param {Number} min	the minute value
 * @param {Number} sec	the second value
 * @return deg			the decimal degree values
 * @type Number
 * @version 1.0 (2007-04-30)
 * @see #dd2dms
 */
function dms2dd(deg,min,sec) {
	if (deg < 0) {
		return deg - (min / 60) - (sec / 3600);
	}
	else {
		return deg + (min / 60) + (sec / 3600);
	}
}

/**
 * log function, missing in the standard Math object
 * @param {Number} x	the value where the log function should be applied to
 * @param {Number} b	the base value for the log function
 * @return logResult	the result of the log function
 * @type Number
 * @version 1.0 (2007-04-30)
 */
function log(x,b) {
	if(b==null) b=Math.E;
	return Math.log(x)/Math.log(b);
}

/**
 * interpolates a value (e.g. elevation) bilinearly based on the position within a cell with 4 corner values
 * @param {Number} za		the value at the upper left corner of the cell
 * @param {Number} zb		the value at the upper right corner of the cell
 * @param {Number} zc		the value at the lower right corner of the cell
 * @param {Number} zd		the value at the lower left corner of the cell
 * @param {Number} xpos		the x position of the point where a new value should be interpolated
 * @param {Number} ypos		the y position of the point where a new value should be interpolated
 * @param {Number} ax		the x position of the lower left corner of the cell
 * @param {Number} ay		the y position of the lower left corner of the cell
 * @param {Number} cellsize	the size of the cell
 * @return interpol_value	the result of the bilinear interpolation function
 * @type Number
 * @version 1.0 (2007-04-30)
 */
function intBilinear(za,zb,zc,zd,xpos,ypos,ax,ay,cellsize) { //bilinear interpolation function
	var e = (xpos - ax) / cellsize;
	var f = (ypos - ay) / cellsize;

	//calculation of weights
	var wa = (1 - e) * (1 - f);
	var wb = e * (1 - f);
	var wc = e * f;
	var wd = f * (1 - e);

	var interpol_value = wa * zc + wb * zd + wc * za + wd * zb;
	return interpol_value;	
}

/**
 * tests if a given point is left or right of a given line
 * @param {Number} pointx		the x position of the given point
 * @param {Number} pointy		the y position of the given point
 * @param {Number} linex1		the x position of line's start point
 * @param {Number} liney1		the y position of line's start point
 * @param {Number} linex2		the x position of line's end point
 * @param {Number} liney2		the y position of line's end point
 * @return leftof				the result of the leftOfTest, 1 means leftOf, 0 means rightOf
 * @type Number (integer, 0|1)
 * @version 1.0 (2007-04-30)
 */
function leftOfTest(pointx,pointy,linex1,liney1,linex2,liney2) {
	var result = (liney1 - pointy) * (linex2 - linex1) - (linex1 - pointx) * (liney2 - liney1);
	if (result < 0) {
		var leftof = 1; //case left of
	}
	else {
		var leftof = 0; //case left of	
	}
	return leftof;
}

/**
 * calculates the distance between a given point and a given line
 * @param {Number} pointx		the x position of the given point
 * @param {Number} pointy		the y position of the given point
 * @param {Number} linex1		the x position of line's start point
 * @param {Number} liney1		the y position of line's start point
 * @param {Number} linex2		the x position of line's end point
 * @param {Number} liney2		the y position of line's end point
 * @return distance				the result of the leftOfTest, 1 means leftOf, 0 means rightOf
 * @type Number
 * @version 1.0 (2007-04-30)
 */
function distFromLine(xpoint,ypoint,linex1,liney1,linex2,liney2) {
	var dx = linex2 - linex1;
	var dy = liney2 - liney1;
	var distance = (dy * (xpoint - linex1) - dx * (ypoint - liney1)) / Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));
	return distance;
}

/**
 * calculates the angle between two vectors (lines)
 * @param {Number} ax		the x part of vector a
 * @param {Number} ay		the y part of vector a
 * @param {Number} bx		the x part of vector b
 * @param {Number} by		the y part of vector b
 * @return angle			the angle in radians
 * @type Number
 * @version 1.0 (2007-04-30)
 * @credits <a href="http://www.mathe-online.at/mathint/vect2/i.html#Winkel">Mathe Online (Winkel)</a>
 */
function angleBetwTwoLines(ax,ay,bx,by) {
	var angle = Math.acos((ax * bx + ay * by) / (Math.sqrt(Math.pow(ax,2) + Math.pow(ay,2)) * Math.sqrt(Math.pow(bx,2) + Math.pow(by,2))));
	return angle;
}

/**
 * calculates the bisector vector for two given vectors
 * @param {Number} ax		the x part of vector a
 * @param {Number} ay		the y part of vector a
 * @param {Number} bx		the x part of vector b
 * @param {Number} by		the y part of vector b
 * @return c				the resulting vector as an Array, c[0] is the x part of the vector, c[1] is the y part
 * @type Array
 * @version 1.0 (2007-04-30)
 * @credits <a href="http://www.mathe-online.at/mathint/vect1/i.html#Winkelsymmetrale">Mathe Online (Winkelsymmetrale)</a>
 * see #calcBisectorAngle
 *  */
function calcBisectorVector(ax,ay,bx,by) {
	var betraga = Math.sqrt(Math.pow(ax,2) + Math.pow(ay,2));
	var betragb = Math.sqrt(Math.pow(bx,2) + Math.pow(by,2));
	var c = new Array();
	c[0] = ax / betraga + bx / betragb;
	c[1] = ay / betraga + by / betragb;
	return c;
}

/**
 * calculates the bisector angle for two given vectors
 * @param {Number} ax		the x part of vector a
 * @param {Number} ay		the y part of vector a
 * @param {Number} bx		the x part of vector b
 * @param {Number} by		the y part of vector b
 * @return angle			the bisector angle in radians
 * @type Number
 * @version 1.0 (2007-04-30)
 * @credits <a href="http://www.mathe-online.at/mathint/vect1/i.html#Winkelsymmetrale">Mathe Online (Winkelsymmetrale)</a>
 * see #calcBisectorVector
 * */
function calcBisectorAngle(ax,ay,bx,by) {
	var betraga = Math.sqrt(Math.pow(ax,2) + Math.pow(ay,2));
	var betragb = Math.sqrt(Math.pow(bx,2) + Math.pow(by,2));
	var c1 = ax / betraga + bx / betragb;
	var c2 = ay / betraga + by / betragb;
	var angle = toPolarDir(c1,c2);
	return angle;
}

/**
 * calculates the intersection point of two given lines
 * @param {Number} line1x1	the x the start point of line 1
 * @param {Number} line1y1	the y the start point of line 1
 * @param {Number} line1x2	the x the end point of line 1
 * @param {Number} line1y2	the y the end point of line 1
 * @return interSectPoint	the intersection point, interSectPoint.x contains x-part, interSectPoint.y the y-part of the resulting coordinate
 * @type Object
 * @version 1.0 (2007-04-30)
 * @credits <a href="http://astronomy.swin.edu.au/~pbourke/geometry/lineline2d/">P. Bourke</a>
 */
function intersect2lines(line1x1,line1y1,line1x2,line1y2,line2x1,line2y1,line2x2,line2y2) {
	var interSectPoint = new Object();
	var denominator = (line2y2 - line2y1)*(line1x2 - line1x1) - (line2x2 - line2x1)*(line1y2 - line1y1);
	if (denominator == 0) {
		alert("lines are parallel");
	}
	else {
		var ua = ((line2x2 - line2x1)*(line1y1 - line2y1) - (line2y2 - line2y1)*(line1x1 - line2x1)) / denominator;
		var ub = ((line1x2 - line1x1)*(line1y1 - line2y1) - (line1y2 - line1y1)*(line1x1 - line2x1)) / denominator;
	}
	interSectPoint["x"] = line1x1 + ua * (line1x2 - line1x1);
	interSectPoint["y"] = line1y1 + ua * (line1y2 - line1y1);
	return interSectPoint;
}

/**
 * reformats a given number to a string by adding separators at every third digit
 * @param {String|Number} inputNumber	the input number, can be of type number or string
 * @param {String} separator			the separator, e.g. ' or ,
 * @return newString					the intersection point, interSectPoint.x contains x-part, interSectPoint.y the y-part of the resulting coordinate
 * @type String
 * @version 1.0.1 (2011-10-02)
 */
function formatNumberString(inputNumber,separator) {
	//check if of type string, if number, convert it to string
	if (typeof(inputNumber) == "number") {
		var myTempString = inputNumber.toString();
	}
	else {
		var myTempString = inputNumber;
	}
	var newString="";
	//if it contains a comma, it will be split
	var splitResults = myTempString.split(".");
	var myCounter = splitResults[0].length;
	if (myCounter > 3) {
		while(myCounter > 0) {
			if (myCounter > 3) {
				newString = separator + splitResults[0].substr(myCounter - 3,3) + newString;
			}
			else {
				newString = splitResults[0].substr(0,myCounter) + newString;
			}
			myCounter -= 3;
		}
	}
	else {
		newString = splitResults[0];
	}
	//concatenate if it contains a comma
	if (splitResults[1]) {
		newString = newString + "." + splitResults[1];
	}
	return newString;
}

/**
 * writes a status text message out to a SVG text element's first child
 * @param {String} statusText	the text message to be displayed
 * @version 1.0 (2007-04-30)
 */
 function statusChange(statusText) {
	document.getElementById("statusText").firstChild.nodeValue = "Statusbar: " + statusText;
}

/**
 * scales an SVG element, requires that the element has an x and y attribute (e.g. circle, ellipse, use element, etc.)
 * @param {dom::Event} evt		the evt object that triggered the scaling
 * @param {Number} factor	the scaling factor
 * @version 1.0 (2007-04-30)
 */
function scaleObject(evt,factor) {
	//reference to the currently selected object
	var element = evt.currentTarget;
	var myX = element.getAttributeNS(null,"x");
	var myY = element.getAttributeNS(null,"y");
	var newtransform = "scale(" + factor + ") translate(" + (myX * 1 / factor - myX) + " " + (myY * 1 / factor - myY) +")";
	element.setAttributeNS(null,'transform', newtransform);
}

/**
 * returns the transformation matrix (ctm) for the given node up to the root element
 * the basic use case is to provide a wrapper function for the missing SVGLocatable.getTransformToElement method (missing in ASV3)
 * @param {svg::SVGTransformable} node		the node reference for the SVGElement the ctm is queried
 * @return CTM								the current transformation matrix from the given node to the root element
 * @type svg::SVGMatrix
 * @version 1.0 (2007-05-01)
 * @credits <a href="http://www.kevlindev.com/tutorials/basics/transformations/toUserSpace/index.htm">Kevin Lindsey (toUserSpace)</a>
 * @see #getTransformToElement
 */
function getTransformToRootElement(node) {
 	try {
		//this part is for fully conformant players (like Opera, Batik, Firefox, Safari ...)
		var CTM = node.getTransformToElement(document.documentElement);
	}
	catch (ex) {
		//this part is for ASV3 or other non-conformant players
		// Initialize our CTM the node's Current Transformation Matrix
		var CTM = node.getCTM();
		// Work our way through the ancestor nodes stopping at the SVG Document
		while ( ( node = node.parentNode ) != document ) {
			// Multiply the new CTM to the one with what we have accumulated so far
			CTM = node.getCTM().multiply(CTM);
		}
	}
	return CTM;
}

/**
 * returns the transformation matrix (ctm) for the given dom::Node up to a different dom::Node
 * the basic use case is to provide a wrapper function for the missing SVGLocatable.getTransformToElement method (missing in ASV3)
 * @param {svg::SVGTransformable} node			the node reference for the element the where the ctm should be calculated from
 * @param {svg::SVGTransformable} targetNode	the target node reference for the element the ctm should be calculated to
 * @return CTM									the current transformation matrix from the given node to the target element
 * @type svg::SVGMatrix
 * @version 1.0 (2007-05-01)
 * @credits <a href="http://www.kevlindev.com/tutorials/basics/transformations/toUserSpace/index.htm">Kevin Lindsey (toUserSpace)</a>
 * @see #getTransformToRootElement
 */
function getTransformToElement(node,targetNode) {
    try {
        //this part is for fully conformant players
        var CTM = node.getTransformToElement(targetNode);
    }
    catch (ex) {
  		//this part is for ASV3 or other non-conformant players
		// Initialize our CTM the node's Current Transformation Matrix
		var CTM = node.getCTM();
		// Work our way through the ancestor nodes stopping at the SVG Document
		while ( ( node = node.parentNode ) != targetNode ) {
			// Multiply the new CTM to the one with what we have accumulated so far
			CTM = node.getCTM().multiply(CTM);
		}
    }
    return CTM;
}

/**
 * converts HSV to RGB values
 * @param {Number} hue		the hue value (between 0 and 360)
 * @param {Number} sat		the saturation value (between 0 and 1)
 * @param {Number} val		the value value (between 0 and 1)
 * @return rgbArr			the rgb values (associative array or object, the keys are: red,green,blue), all values are scaled between 0 and 255
 * @type Object
 * @version 1.0 (2007-05-01)
 * @see #rgb2hsv
 */
function hsv2rgb(hue,sat,val) {
	var rgbArr = new Object();
	if ( sat == 0) {
		rgbArr["red"] = Math.round(val * 255);
		rgbArr["green"] = Math.round(val * 255);
		rgbArr["blue"] = Math.round(val * 255);
	}
	else {
		var h = hue / 60;
		var i = Math.floor(h);
		var f = h - i;
		if (i % 2 == 0) {
			f = 1 - f;
		}
		var m = val * (1 - sat); 
		var n = val * (1 - sat * f);
		switch(i) {
			case 0:
				rgbArr["red"] = val;
				rgbArr["green"] = n;
				rgbArr["blue"] = m;
				break;
			case 1:
				rgbArr["red"] = n;
				rgbArr["green"] = val;
				rgbArr["blue"] = m;
				break;
			case 2:
				rgbArr["red"] = m;
				rgbArr["green"] = val;
				rgbArr["blue"] = n;
				break;
			case 3:
				rgbArr["red"] = m;
				rgbArr["green"] = n;
				rgbArr["blue"] = val;
				break;
			case 4:
				rgbArr["red"] = n;
				rgbArr["green"] = m;
				rgbArr["blue"] = val;
				break;
			case 5:
				rgbArr["red"] = val;
				rgbArr["green"] = m;
				rgbArr["blue"] = n;
				break;
			case 6:
				rgbArr["red"] = val;
				rgbArr["green"] = n;
				rgbArr["blue"] = m;
				break;
		}
		rgbArr["red"] = Math.round(rgbArr["red"] * 255);
		rgbArr["green"] = Math.round(rgbArr["green"] * 255);
		rgbArr["blue"] = Math.round(rgbArr["blue"] * 255);
	}
	return rgbArr;
}

/**
 * converts RGB to HSV values
 * @param {Number} red		the hue value (between 0 and 255)
 * @param {Number} green	the saturation value (between 0 and 255)
 * @param {Number} blue		the value value (between 0 and 255)
 * @return hsvArr			the hsv values (associative array or object, the keys are: hue (0-360),sat (0-1),val (0-1))
 * @type Object
 * @version 1.0 (2007-05-01)
 * @see #hsv2rgb
 */
function rgb2hsv(red,green,blue) {
	var hsvArr = new Object();
	red = red / 255;
	green = green / 255;
	blue = blue / 255;
	myMax = Math.max(red, Math.max(green,blue));
	myMin = Math.min(red, Math.min(green,blue));
	v = myMax;
	if (myMax > 0) {
		s = (myMax - myMin) / myMax;
	}
	else {
		s = 0;
	}
	if (s > 0) {
		myDiff = myMax - myMin;
		rc = (myMax - red) / myDiff;
		gc = (myMax - green) / myDiff;
		bc = (myMax - blue) / myDiff;
		if (red == myMax) {
			h = (bc - gc) / 6;
		}
		if (green == myMax) {
			h = (2 + rc - bc) / 6;
		}
		if (blue == myMax) {
			h = (4 + gc - rc) / 6;
		}
	}
	else {
		h = 0;
	}
	if (h < 0) {
		h += 1;
	}
	hsvArr["hue"] = Math.round(h * 360);
	hsvArr["sat"] = s;
	hsvArr["val"] = v;
	return hsvArr;
}

/**
 * populates an array such that it can be addressed by both a key or an index nr,
 * note that both Arrays need to be of the same length
 * @param {Array} arrayKeys		the array containing the keys
 * @param {Array} arrayValues	the array containing the values
 * @return returnArray			the resulting array containing both associative values and also a regular indexed array
 * @type Array
 * @version 1.0 (2007-05-01)
 */
function arrayPopulate(arrayKeys,arrayValues) {
	var returnArray = new Array();
	if (arrayKeys.length != arrayValues.length) {
		alert("error: arrays do not have the same length!");
	}
	else {
		for (i=0;i<arrayKeys.length;i++) {
			returnArray[arrayKeys[i]] = arrayValues[i];
		}
	}
	return returnArray;
}

/**
 * Wrapper object for network requests, uses getURL or XMLHttpRequest depending on availability
 * The callBackFunction receives a XML or text node representing the rootElement
 * of the fragment received or the return text, depending on the returnFormat. 
 * See also the following <a href="http://www.carto.net/papers/svg/network_requests/">documentation</a>.
 * @class this is a wrapper object to provide network request functionality (get|post)
 * @param {String} url												the URL/IRI of the network resource to be called
 * @param {Function|Object} callBackFunction						the callBack function or object that is called after the data was received, in case of an object, the method 'receiveData' is called; both the function and the object's 'receiveData' method get 2 return parameters: 'node.firstChild'|text (the root element of the XML or text resource), this.additionalParams (if defined) 
 * @param {String} returnFormat										the return format, either 'xml' or 'json' (or text)
 * @param {String} method											the method of the network request, either 'get' or 'post'
 * @param {String|Undefined} postText								the String containing the post text (optional) or Undefined (if not a 'post' request)
 * @param {Object|Array|String|Number|Undefined} additionalParams	additional parameters that will be passed to the callBackFunction or object (optional) or Undefined
 * @return a new getData instance
 * @type getData
 * @constructor
 * @version 1.0 (2007-02-23)
 */
function getData(url,callBackFunction,returnFormat,method,postText,additionalParams) {
	this.url = url;
	this.callBackFunction = callBackFunction;
	this.returnFormat = returnFormat;
	this.method = method;
	this.additionalParams = additionalParams;
	if (method != "get" && method != "post") {
		alert("Error in network request: parameter 'method' must be 'get' or 'post'");
	}
	this.postText = postText;
	this.xmlRequest = null; //@private reference to the XMLHttpRequest object
} 

/**
 * triggers the network request defined in the constructor
 */
getData.prototype.getData = function() {
	//call getURL() if available
	if (window.getURL) {
		if (this.method == "get") {
			getURL(this.url,this);
		}
		if (this.method == "post") {
			postURL(this.url,this.postText,this);
		}
	}
	//or call XMLHttpRequest() if available
	else if (window.XMLHttpRequest) {
		var _this = this;
		this.xmlRequest = new XMLHttpRequest();
		if (this.method == "get") {
			if (this.returnFormat == "xml") {
				if (this.xmlRequest.overrideMimeType) {
					this.xmlRequest.overrideMimeType("text/xml");
				}
			}
			this.xmlRequest.open("GET",this.url,true);
		}
		if (this.method == "post") {
			this.xmlRequest.open("POST",this.url,true);
		}
		this.xmlRequest.onreadystatechange = function() {_this.handleEvent()};
		if (this.method == "get") {
			this.xmlRequest.send(null);
		}
		if (this.method == "post") {
			//test if postText exists and is of type string
			var reallyPost = true;
			if (!this.postText) {
				reallyPost = false;
				alert("Error in network post request: missing parameter 'postText'!");
			}
			if (typeof(this.postText) != "string") {
				reallyPost = false;
				alert("Error in network post request: parameter 'postText' has to be of type 'string')");
			}
			if (reallyPost) {
				this.xmlRequest.send(this.postText);
			}
		}
	}
	//write an error message if neither method is available
	else {
		alert("your browser/svg viewer neither supports window.getURL nor window.XMLHttpRequest!");
	}	
}

/**
 * this is the callback method for the getURL() or postURL() case
 * @private
 */
getData.prototype.operationComplete = function(data) {
	//check if data has a success property
	if (data.success) {
		//parse content of the XML format to the variable "node"
		if (this.returnFormat == "xml") {
			//convert the text information to an XML node and get the first child
			var node = parseXML(data.content,document);
			//distinguish between a callback function and an object
			if (typeof(this.callBackFunction) == "function") {
				this.callBackFunction(node.firstChild,this.additionalParams);
			}
			if (typeof(this.callBackFunction) == "object") {
				this.callBackFunction.receiveData(node.firstChild,this.additionalParams);
			}
		}
		if (this.returnFormat == "json") {
			if (typeof(this.callBackFunction) == "function") {
				this.callBackFunction(data.content,this.additionalParams);
			}
			if (typeof(this.callBackFunction) == "object") {
				this.callBackFunction.receiveData(data.content,this.additionalParams);
			}			
		}
	}
	else {
		alert("something went wrong with dynamic loading of geometry!");
	}
}

/**
 * this is the callback method for the XMLHttpRequest case
 * @private
 */
getData.prototype.handleEvent = function() {
	if (this.xmlRequest.readyState == 4) {
		if (this.returnFormat == "xml") {
			//we need to import the XML node first
			var parser = new DOMParser();
			var doc = parser.parseFromString(this.xmlRequest.responseText,"text/xml");
			var importedNode = document.importNode(doc.documentElement,true);
			if (typeof(this.callBackFunction) == "function") {
				this.callBackFunction(importedNode,this.additionalParams);
			}
			if (typeof(this.callBackFunction) == "object") {
				this.callBackFunction.receiveData(importedNode,this.additionalParams);
			}			
		}
		if (this.returnFormat == "json") {
			if (typeof(this.callBackFunction) == "function") {
				this.callBackFunction(this.xmlRequest.responseText,this.additionalParams);
			}
			if (typeof(this.callBackFunction) == "object") {
				this.callBackFunction.receiveData(this.xmlRequest.responseText,this.additionalParams);
			}			
		}		
	}	
}

/**
 * Serializes an XML node and returns a string representation. Wrapper function to hide implementation differences. 
 * This can be used for debugging purposes or to post data to a server or network resource.
 * @param {dom::Node} node		the DOM node reference
 * @return textRepresentation	the String representation of the XML node
 * @type String
 * @version 1.0 (2007-05-01)
 * @see getData
 */
function serializeNode(node) {
  if (typeof XMLSerializer != 'undefined') {
    return new XMLSerializer().serializeToString(node);
  }
  else if (typeof node.xml != 'undefined') {
    return node.xml;
  }
  else if (typeof printNode != 'undefined') {
    return printNode(node);
  }
  else if (typeof Packages != 'undefined') {
    try {
      var stringWriter = new java.io.StringWriter();
      Packages.org.apache.batik.dom.util.DOMUtilities.writeNode(node,stringWriter);
      return stringWriter.toString();
    }
    catch (e) {
       alert("Sorry, your SVG viewer does not support the printNode/serialize function.");
       return '';
    }
  }
  else {
    alert("Sorry, your SVG viewer does not support the printNode/serialize function.");
    return '';
  }
}

/**
 * Starts a SMIL animation element with the given id by triggering the '.beginElement()' method. 
 * This is a convenience (shortcut) function. 
 * @param {String} id		a valid id of a valid SMIL animation element
 * @version 1.0 (2007-05-01)
 */
//starts an animtion with the given id
//this function is useful in combination with window.setTimeout()
function startAnimation(id) {
		document.getElementById(id).beginElement();
}
