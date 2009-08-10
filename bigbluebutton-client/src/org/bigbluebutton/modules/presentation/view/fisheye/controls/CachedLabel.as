/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 * 
 * Author: http://www.quietlyscheming.com/blog/components/fisheye-component/
 */


package org.bigbluebutton.modules.presentation.view.fisheye.controls
{
	import mx.core.UIComponent;
	import mx.core.UITextField;
	import mx.core.IDataRenderer;
	import flash.geom.*;
	
	import flash.display.*
	import flash.text.TextLineMetrics;;
	
/**
 *  Color of text in the component, including the component label.
 *  The default value is <code>0x0B333C</code>.
 */
[Style(name="color", type="uint", format="Color", inherit="yes")]

/**
 *  Color of the component if it is disabled.
 *  The default value is <code>0xAAB3B3</code>.
 */
[Style(name="disabledColor", type="uint", format="Color", inherit="yes")]

/**
 *  Name of the font to use.
 *  Unlike in a full CSS implementation,
 *  comma-separated lists are not supported.
 *  You can use any font family name.
 *  If you specify a generic font name,
 *  it is converted to an appropriate device font.
 *  The default value is <code>"Verdana"</code>.
 */
[Style(name="fontFamily", type="String", inherit="yes")]

/**
 *  Height of the text in pixels.
 *  The default value is 10.
 */
[Style(name="fontSize", type="Number", format="Length", inherit="yes")]

/**
 *  Determines whether the text is italic font.
 *  Recognized values are <code>"normal"</code> and <code>"italic"</code>.
 *  The default value is <code>normal</code>.
 */
[Style(name="fontStyle", type="String", enumeration="normal,italic", inherit="yes")]

/**
 *  Determines whether the text is boldface.
 *  Recognized values are <code>"normal"</code> and <code>"bold"</code>.
 *  The default value is <code>normal</code>.
 */
[Style(name="fontWeight", type="String", enumeration="normal,bold", inherit="yes")]

/**
 *  Alignment of text within a container.
 *  Possible values are <code>"left"</code>, <code>"right"</code>,
 *  or <code>"center"</code>.
 *  The default value is <code>"left"</code>.<br>
 *  For the Button, LinkButton, and AccordionHeader components,
 *  the default value is <code>"center"</code>.
 *  For these components, this property is only recognized when the
 *  <code>labelPlacement</code> property is set to <code>"left"</code> or
 *  <code>"right"</code>.
 *  If <code>labelPlacement</code> is set to <code>"top"</code> or
 *  <code>"bottom"</code>, the text and any icon are centered.
 */
[Style(name="textAlign", type="String", enumeration="left,center,right", inherit="yes")]

/**
 *  Offset of first line of text from the left side of the container.
 *  The default value is 0.
 */
[Style(name="textIndent", type="Number", format="Length", inherit="yes")]

	public class CachedLabel extends UIComponent implements IDataRenderer
	{
		private var _label:UITextField;
		private var _bitmap:Bitmap;
		private var _capturedText:BitmapData;
		private static var xUnit:Point = new Point(1,0);
		private static var origin:Point = new Point(0,0);
		private var _data:Object;
		private var _text:String = "";

		private var _cachePolicy:String = "auto";

		public function CachedLabel()
		{
			super();	
		}
		
		public function set useCache(value:String):void
		{
			_cachePolicy = value;
			invalidateDisplayList();
		}
		public function get useCache():String
		{
			return _cachePolicy;
		}
		override protected function createChildren():void
		{
			super.createChildren();
			
			_label = new UITextField();
			_label.multiline = true;
			_label.selectable = false;
			_label.autoSize = "left";
			_label.text = _text;
			addChild(_label);
			
		}
		
		override protected function measure():void
		{
			_label.validateNow();
			if(_label.embedFonts)
			{
				measuredWidth = _label.measuredWidth + 6;
				measuredHeight = _label.measuredHeight + 4;
			}
			else
			{
				var metrics:TextLineMetrics = measureText(_text);
				measuredWidth = metrics.width + 6;
				measuredHeight  = metrics.height + 4;
			}
		}
		
		override protected function updateDisplayList(unscaledWidth:Number,
												  unscaledHeight:Number):void
		{
			
			_label.validateNow();
			_label.setActualSize(unscaledWidth, unscaledHeight );

			var localX:Point;
			var localO:Point;
			var useLabel:Boolean = true;
			
			switch(_cachePolicy)
			{
				case "off":
					useLabel = true;
					break;
				case "on":
					useLabel = false;
					break;
				case "auto":
					if(_label.embedFonts == false && unscaledWidth > 0 && unscaledHeight > 0)
					{
						localX = globalToLocal(xUnit);			
						localO = globalToLocal(origin);
						useLabel = (localX.x - localO.x) == 1 && (localX.y - localO.y) == 0;
					}
			}

			if(unscaledHeight <= 1 || unscaledWidth <= 1)
				useLabel = true;
				
			if(useLabel)
			{
				if(_bitmap != null)
				{
					removeChild(_bitmap);
					_bitmap = null;
				}
				_label.visible = true;
			}
			else
			{
				_label.visible = false;
				if(_capturedText == null || _capturedText.width != unscaledWidth || _capturedText.height != unscaledHeight )
				{
					_capturedText = new BitmapData(unscaledWidth,unscaledHeight);
					
					if(_bitmap != null)
					{
						removeChild(_bitmap);
						_bitmap = null;
					}
				}
				if(_bitmap == null)
				{
					_bitmap = new Bitmap(_capturedText);
					_bitmap.smoothing = true;
					addChild(_bitmap);
				}
				_capturedText.fillRect(new Rectangle(0,0,unscaledWidth,unscaledHeight),0);
				_capturedText.draw(_label);
			}
		}

		[Inspectable(environment="none")]
		public function get data():Object
		{
			return _data;
		}

		/**
		 *  @private
		 */
		public function set data(value:Object):void
		{
			if( value == _data)	
				return;
				
			_data = value;
			
			_text = String(value);
			if(_label != null)
				_label.text = (_text == null)? "":_text;
			invalidateSize();
			invalidateDisplayList();
		}
	override public function invalidateSize():void
	{
		super.invalidateSize();
	}
	}
}