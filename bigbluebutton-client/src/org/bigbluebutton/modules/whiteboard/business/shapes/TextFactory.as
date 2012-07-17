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
	public class TextFactory extends GraphicFactory
	{

		public function TextFactory() {
			super(GraphicFactory.TEXT_FACTORY);
		}

		
		public function createTextObject(txt:String, txtColor:uint,
										 bgColor:uint, bgColorVisible:Boolean,
										 x:Number, y:Number, textSize:Number):TextObject {
			
			var newX:Number = normalize(x,_parentWidth);
			var newY:Number = normalize(y,_parentHeight);
			var tobj:TextObject = new TextObject(txt, txtColor, bgColor, bgColorVisible, 
												newX, newY, textSize);
			tobj.makeGraphic(_parentWidth,_parentHeight);
			return tobj;
		}
		
		/* convenience method for above method, takes a TextObject and returns one
			with "normalized" coordinates
		*/
		public function makeTextObject(t:TextObject):TextObject {
			return createTextObject(t.text, t.textColor, t.backgroundColor, t.background,
									t.x, t.y, t.textSize);
		}
	}
}