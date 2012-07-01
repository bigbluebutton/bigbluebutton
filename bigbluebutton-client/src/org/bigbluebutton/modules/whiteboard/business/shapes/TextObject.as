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
	import flash.text.TextField;
	import flash.text.TextFieldType;

	public class TextObject extends GraphicObject {
		public var color:uint;
		public var text:String;
		public var textField:TextField;
		
		public function TextObject() {
			super(GraphicObject.TYPE_TEXT);
		}
		
		public function getTextField():TextField {
			return textField;
		}
		
		public function makeEditableTextObject(parentWidth:Number, parentHeight:Number,
									   x:Number, y:Number):void {
			var startX:Number = denormalize(x, parentWidth);
			var startY:Number = denormalize(y, parentHeight);
			textField = new TextField();
			textField.type = TextFieldType.INPUT;
		}
			
		public function makeDynamicTextObject(parentWidth:Number, parentHeight:Number,
											   x:Number, y:Number):void {
			var startX:Number = denormalize(x, parentWidth);
			var startY:Number = denormalize(y, parentHeight);
			textField = new TextField();
			textField.type = TextFieldType.DYNAMIC;
		}
	}
}