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
	public class GraphicObject
	{
		public static const TYPE_SHAPE:String = "TYPE_SHAPE";
		public static const TYPE_TEXT:String = "TYPE_TEXT";
		
		protected var graphic_type:String;
		
		public function GraphicObject(type:String) {
			this.graphic_type = type;
		}
		
		public function getGraphicType():String {
			return graphic_type;
		}
		
		protected function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		protected function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
	}
}