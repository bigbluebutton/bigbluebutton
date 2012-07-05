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
	import flash.display.DisplayObject;
	
	import org.bigbluebutton.common.LogUtil;

	public class GraphicObject
	{
		public static const TYPE_SHAPE:String = "SHAPE";
		public static const TYPE_TEXT:String = "TEXT";
		public static const TYPE_SELECTION:String = "SELECTION";
		public static const TYPE_INVALID:String = "INVALID";
		
		protected var graphic_type:String = TYPE_INVALID;
		/**
		 * ID we can use to match the feedback shape in the presenter's view so we can
		 * remove it. Also a unique identifier of each GraphicObject
		 */
		protected var ID:String;
		//protected var isIDSet:Boolean = false;
		
		public function GraphicObject(type:String) {
			this.graphic_type = type;
		}
		
		public function getGraphicType():String {
			return graphic_type;
		}
		
		public function getGraphicID():String {
			return ID;
		}
		
		public function setGraphicID(id:String):void {
			//if(!isIDSet) {
				this.ID = id;
			//	isIDSet = true;	
			//} else LogUtil.error("ERROR: ID is already set");
		}
		
		/*public function isIDSet():Boolean {
			return isIDSet;
		}*/
		
		protected function denormalize(val:Number, side:Number):Number {
			return (val*side)/100.0;
		}
		
		protected function normalize(val:Number, side:Number):Number {
			return (val*100.0)/side;
		}
		
		public function getGraphic():DisplayObject {
			if(graphic_type == TYPE_INVALID) {
				LogUtil.debug("Callin getGraphic on invalid GraphicObject");
			}
			return null;
		}
		
		public function makeGraphic(parentWidth:Number, 
									   parentHeight:Number):void {
			return;
		}
	}
}