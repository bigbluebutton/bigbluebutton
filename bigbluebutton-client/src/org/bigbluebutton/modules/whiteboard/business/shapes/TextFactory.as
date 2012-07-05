/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 * 
 * Author: Ajay Gopinath <ajgopi124@gmail.com>
 */
package org.bigbluebutton.modules.whiteboard.business.shapes
{
	public class TextFactory extends GraphicFactory
	{
		private var _parentWidth:Number = 0;
		private var _parentHeight:Number = 0;
		
		public function TextFactory() {
			super(GraphicFactory.TEXT_FACTORY);
		}


		public function setParentDim(width:Number, height:Number):void {
			_parentWidth = width;
			_parentHeight = height;
		}
		
		public function cloneTextObject(txt:String, txtColor:uint,
										 bgColor:uint, bgColorVisible:Boolean,
										 x:Number, y:Number):TextObject {
			var tobj:TextObject = new TextObject();
			tobj.x = x;
			tobj.y = y;
			tobj.text = txt;
			tobj.textColor = txtColor;
			tobj.backgroundColor = bgColor;
			tobj.background = bgColorVisible;
			return tobj;
		}
		
		public function createTextObject(txt:String, txtColor:uint,
										 bgColor:uint, bgColorVisible:Boolean,
										 x:Number, y:Number):TextObject {
			var tobj:TextObject = new TextObject();
			tobj.x = normalize(x,_parentWidth);
			tobj.y = normalize(y,_parentHeight);
			tobj.text = txt;
			tobj.textColor = txtColor;
			tobj.backgroundColor = bgColor;
			tobj.background = bgColorVisible;
			tobj.makeGraphic(_parentWidth,_parentHeight);
			return tobj;
		}
		
		public function makeTextObject(t:TextObject):TextObject {
			// pretty much a dummy method until further subclasses
			// of TextObject come into play
			var tobj:TextObject = new TextObject();
			tobj.text = t.text;
			tobj.textColor = t.textColor;
			tobj.backgroundColor = t.backgroundColor;
			tobj.background = t.background;
			tobj.x = normalize(t.x,_parentWidth);
			tobj.y = normalize(t.y,_parentHeight);
			tobj.makeGraphic(_parentWidth,_parentHeight);
			return tobj;
		}

		public function getParentWidth():Number {
			return _parentWidth;
		}
		
		public function getParentHeight():Number {
			return _parentHeight;
		}
	}
}