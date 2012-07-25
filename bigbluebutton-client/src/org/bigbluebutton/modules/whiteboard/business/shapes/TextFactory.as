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
 * Author: Ajay Gopinath <ajgopi124(at)gmail(dot)com>
 */
package org.bigbluebutton.modules.whiteboard.business.shapes
{
    import org.bigbluebutton.common.LogUtil;

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
		
		public function createTextObject(txt:String, txtColor:uint, bgColor:uint, bgColorVisible:Boolean, x:Number, y:Number, textSize:Number):TextObject {		           
			var tobj:TextObject = new TextObject(txt, txtColor, bgColor, bgColorVisible, normalize(x , _parentWidth), normalize(y, _parentHeight), textSize);
			return tobj;
		}
		
		/* convenience method for above method, takes a TextObject and returns one with "normalized" coordinates */
		public function makeTextObject(t:TextObject):TextObject {
            LogUtil.debug("***Making textObject [" + t.text + ", [" + t.x + "," + t.y + "]");
            var tobj:TextObject = new TextObject(t.text, t.textColor, t.backgroundColor, t.background, t.x, t.y, t.textSize);
            tobj.makeGraphic(_parentWidth,_parentHeight);
            LogUtil.debug("***Made textObject [" + tobj.text + ", [" + tobj.x + "," + tobj.y + "]");
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