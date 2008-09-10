/**
A Customizable static class for generating and displaying Tooltips from anywhere in your code.<br>
Must reside in a folder structure corresponding to the package: com.neoarchaic.ui.  There are no assests for the library, since the tooltip is created and drawn dynamically.<br>

The tooltip is created by invoking the static Tooltip class methods: Tooltip.show() and Tooltip.hide() (see method documentation for each method). <br>

This tooltip supports html and will use CSS to style the text, if the html option is set to true. The passed toolitp text will then be automatically enclosed in a <body> tag. The default value for the html option is false.

You can customize the tool both globally and locally.<br>
Globally: Set options one at a time by using the static setOption () method. <br>
To set multiple options in one go, set the public "options" property to an object containing one or more options (see example). <br>
Locally: Pass an object with the options to the static Tooltip.show () method.
In either case, only the options that have default values will be used, the rest will be ignored.

<b>Examples:</b><br>
<code>
import com.neoarchaic.ui.Tooltip; <br>
Tooltip.options = {html: true, width: 300}<br>
Tooltip.setOption("delay", 1) <br>
Tooltip.show("Hi, I'm a tooltip. \nI can have multiple lines and I also wrap around") <br>
Tooltip.show("Hi, I'm a delayed tooltip.", {delay: 2}) <br>
Tooltip.hide() <br>
</code>

<b>Author:</b><br>
Karina Steffens <br>
Neo-Archaic </br>
<a href = "http://www.neo-archaic.net" target = "_blank"> www.neo-archaic.net </a> <br>
February 2005
@class
*/

class com.neoarchaic.ui.Tooltip {
	private static var t:Number;
	private static var __options:Object = {
		delay:0.5,
		width:200,
		bgColor:0xFFFFDD,
		alpha:85,
		corner:5,
		margin:2,
		font:"Verdana",
		color:0x000000,
		size:11,
		bold:false,
		html:false
	};
	/** Use to change multiple default options globally
	@param options:Object <b>An object with the following optional properties:</b>

	@param options.delay:Number delay in seconds (default: 0.5 second)
	@param options.width:Number maximum width of the tooltip window (default: 200px)
	@param options.bgColor:Color Background color of the tooltip (default: 0xFFFFDD - light yellow)
	@param options.alpha:Number Transparency of the tooltip (default: 85)
	@param optoins.corner:Number The diameter for the rounded corner (default: 5, for sharp corners pass 0)
	@param options.margin:Number (default: 2);
	@param options.font:String (default: "Verdana")
	@param options.color:Color Text and line color (default 0xFFFFFF)
	@param options.size:Number Font size (default: 10)
	@param options.bold:Boolean (default: false)
	@param options.html:Boolean (default: true)
	*/
	public static function get options ():Object {
		return Tooltip.__options;
	}
	public static function set options (value:Object):Void {
		for (var i in value) {
			Tooltip.__options[i] = value[i];
		}
	}

	/**
	Use to change a single default option globally .
	@param optionName The property name of the option.
	@param optionValue The new value for the option.
	*/
	public static function setOption (optionName:String, optionValue:Object):Void {
		Tooltip.__options[optionName] = optionValue;
	}

	/**
	Show the Tooltip after a delay <br>
	Example 1: (No options) <br>
	<code>Tooltip.show ("Here is some example text for the static tooltip class"); </code><br>
	Example 2: (One option) <br>
	<code>Tooltip.show ("Here is some example text for the static tooltip class", {delay: 0}); </code><br>
	Example 3: (Many options)<br>
	<code>Tooltip.show ("Here is some example text for the static tooltip class", {delay:1, width:300, bgColor:0xFFFFFF, alpha:80, corner: 10, margiin:5, font: "Times New Roman", size: 14,  color: 0x000099, bold:true, html:true}); </code>
	 @param tipText text to display
	 @param options Use to temporarily override the default/global options
	*/

	public static function show (tipText:String, options:Object):Void {
		Tooltip.hide ();
		var delay = (options != undefined) && (options.delay != undefined) && (options.delay >= 0) ? options.delay : Tooltip.__options.delay;
		delay *= 1000;
		Tooltip.t = setInterval (Tooltip.doShow, delay, tipText, options);
	}

	/**
	Destroy or hide the Tooltip - if DepthManager is present, than the tooltip will be hidden.<br>
	example: <code>Tooltip.hide()</code>
	*/
	/**
	 *
	 * @usage
	 * @return
	 */
	public static function hide ():Void {
		clearInterval (Tooltip.t);
		//Workaround: _root.tooltip_mc.removeMovieClip() - doesn't work if DepthManager is present, so in that case the tooltip will be cleared instead and it's depth reused.
		_root.tooltip_mc.removeMovieClip ();
		if (_root.tooltip_mc != undefined) {
			//clear the tooltip that still exists on the stage
			_root.tooltip_mc.clear ();
			_root.tooltip_mc.tooltip_txt.removeTextField()
		}
	}

	//Display the Tooltip
	private static function doShow (tipText:String, options:Object):Void {
		clearInterval (Tooltip.t);
		Tooltip.createTipClip ();
		var defOptions:Object = Tooltip.options;
		if (options == undefined) {
			options = defOptions;
		} else {
			for (var i in defOptions) {
				if (options[i] == undefined) {
					options[i] = defOptions[i];
				}
			}
		}

		//Style the tooltip
		var myformat:TextFormat;
		var style:TextField.StyleSheet
		if (options.html) {
			//Use CSS
			style = new TextField.StyleSheet ();
			var styleObj:Object = new Object ();
			styleObj.color = typeof (options.color) == "string" ? options.color : "#" + options.color.toString (16);
			styleObj.fontFamily = options.font;
			styleObj.fontSize = options.size.toString ();
			if (options.bold) {
				styleObj.fontWeight = "bold";
			}
			styleObj.marginLeft = options.margin;
			styleObj.marginRight = options.margin;
			style.setStyle ("body", styleObj);
			//Create a textFormat object for the metrics
			myformat = style.transform ("body");
		} else {
			//Create a new textFormat object
			myformat = new TextFormat ();
			//Assign options to the text format
			myformat.color = options.color;
			myformat.font = options.font;
			myformat.size = options.size;
			myformat.bold = options.bold;
			myformat.leftMargin = myformat.rightMargin = options.margin;
		}

		//Calculate dimensions
		var corner:Number = options.corner;
		var bgColor = options.bgColor;
		var alpha = options.alpha;
		var xoffset:Number = 20;
		var yoffset:Number = 25;
		var x:Number = _root._xmouse + xoffset;
		var y:Number = _root._ymouse + yoffset;
		var w:Number = options.width >= 100 ? options.width : 200;
		w = Math.min (w, Stage.width - xoffset * 2);
		//Get the text extent for the string - wrapping...
		var metrics_wrap:Object = myformat.getTextExtent (tipText, w);
		//...and non-wrapping
		var metrics_nowrap:Object = myformat.getTextExtent (tipText);
		//Adjust the width to fit the text
		w = Math.min (metrics_nowrap.textFieldWidth + options.margin * 2, metrics_wrap.textFieldWidth);
		var h:Number = metrics_wrap.textFieldHeight;
		//Create a new text field to the bottom right of the cursor.
		var tip:MovieClip = _root.tooltip_mc
		tip.createTextField ("tooltip_txt", 0, x, y, w, h);
		var tiptext:TextField = tip.tooltip_txt;

		tiptext.selectable = false;
		tiptext.multiline = true;
		tiptext.wordWrap = true;
		tiptext.autoSize = "left";
		tiptext.html = options.html;
			//Display the text
			if (tiptext.html) {
				tiptext.styleSheet = style;
				tiptext.htmlText = "<body>";
				tiptext.htmlText += tipText;
				tiptext.htmlText += "</body>";
			} else {
				//Format the Tooltip
				tiptext.setNewTextFormat (myformat);
				tiptext.text = tipText;
			}

			//Constrain to the boundries of the stage
			//Convert the loc to global scope
			var point:Object = {x:x, y:y};
			_root.localToGlobal (point);
			var r:Number = tiptext._width + point.x;
			var l:Number = tiptext._height + point.y;
			if (Stage.width < r) {
				//Move the Tooltip to the left
				tip._x -= r - Stage.width + xoffset;
			}
			if (Stage.height < l) {
				//Move the Tooltip above the cursor
				if (tip._height >= (Stage.height / 2)) {
					// if tootip is larger than half the size of the stage, just move the difference in heights
					tip._y -= (Math.abs (l - Stage.height) + yoffset);
				} else {
					// otherwize, put above the cursor
					tip._y -= (tiptext._height + yoffset);
				}
			}

			//Draw the tooltip's shadow
			x = tiptext._x + 3;
			y = tiptext._y + 3;
			h = tiptext._height;
			for (var i = 0; i < 3; i++, x++, y++) {
				Tooltip.drawRect (x, y, w, h, corner, 0x000000, 10);
			}
			//Draw the tooltip's backround
			x = tiptext._x;
			y = tiptext._y;
			tip.lineStyle (1, options.color, 50);
			Tooltip.drawRect (x, y, w, h, corner, bgColor, 100);
			tip._alpha = alpha;
	}

	//Draw a rectangle with the passed coordiantes
	private static function drawRect (x, y, w, h, corner, bgColor, alpha):Void {
		with (_root.tooltip_mc) {
			beginFill (bgColor, alpha);
			if (corner) {
				//With rounded corners:
				moveTo (x + corner, y);
				lineTo (x + w - corner, y);
				curveTo (x + w, y, x + w, y + corner);
				lineTo (x + w, y + h - corner);
				curveTo (x + w, y + h, x + w - corner, y + h);
				lineTo (x + corner, y + h);
				curveTo (x, y + h, x, y + h - corner);
				lineTo (x, y + corner);
				curveTo (x, y, x + corner, y);
			} else {
				//With sharp corners:
				moveTo (x, y);
				lineTo (x + w, y);
				lineTo (x + w, y + h);
				lineTo (x, y + h);
				lineTo (x, y);
			}
			endFill ();
		}
	}

	//Create an empty tooltip clip either in the current tooltip's depth or in the nextHighestDepth (+1 in case the DepthManager is present)
	private static function createTipClip ():Void {
		var d:Number
		if (_root.tooltip_mc != undefined) {
			d = _root.tootip_mc.getDepth();
		} else {
			d = _root.getNextHighestDepth () + 1;
		}
		_root.createEmptyMovieClip ("tooltip_mc", d);
	}
}
