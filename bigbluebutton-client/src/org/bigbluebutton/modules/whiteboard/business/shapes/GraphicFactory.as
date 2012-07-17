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
	import flash.display.DisplayObject;

	public class GraphicFactory
	{
		public static const SHAPE_FACTORY:String = "SHAPE_FACTORY";
		public static const TEXT_FACTORY:String = "TEXT_FACTORY";
		
		public var factory_type:String;
		protected var _parentWidth:Number = 0;
		protected var _parentHeight:Number = 0;	
		
		public function GraphicFactory(type:String) {
			this.factory_type = type;
		}
		
		public function setParentDim(width:Number, height:Number):void {
			_parentWidth = width;
			_parentHeight = height;
		}
		
		protected function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		protected function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
	}
}