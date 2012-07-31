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
package org.bigbluebutton.modules.whiteboard.managers
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.TextObject;
	import org.bigbluebutton.modules.whiteboard.business.shapes.WhiteboardConstants;
	
	public class Page extends ArrayCollection
	{
		private var isGrid:Boolean = false;;
		
		public function Page(source:Array=null)
		{
			super(source);
		}
		
		public function toggleGrid():void {
			isGrid = !isGrid;
		}
		
		public function isGridToggled():Boolean {
			return isGrid;
		}
		
		public function addToPage(gobj:GraphicObject):void {
			/*if(gobj.getGraphicType() == WhiteboardConstants.TYPE_SHAPE) {
				if ((gobj as DrawObject).status != DrawObject.DRAW_END) return
			} else if(gobj.getGraphicType() == WhiteboardConstants.TYPE_TEXT) {
				if ((gobj as TextObject).status != TextObject.TEXT_PUBLISHED) return
			}*/
			if(!containsUniqueInPage(gobj.getGraphicID()))
				this.addItem(gobj);
			//else //LogUtil.error("Adding previously existing item to page: " + gobj.getGraphicID());
		}
		
		public function removeFromPage(gobj:GraphicObject):void {
			this.removeItemAt(getIndexOf(gobj));
		}
		
		private function getIndexOf(gobj:GraphicObject):int {
			var thisID:String = gobj.getGraphicID();
			for(var i:int = 0; i < this.length; i++) {
				var currObj:GraphicObject = this[i];
				if(thisID == currObj.getGraphicID()) return i;
			}
			return -1;
		}
		
		private function getIndexOfID(id:String):int {
			for(var i:int = 0; i < this.length; i++) {
				var currObj:GraphicObject = this[i];
				if(id == currObj.getGraphicID()) return i;
			}
			return -1;
		}
		
		public function modifyInPage(modifyingGobj:GraphicObject):void {
			var indexToModify:int = getIndexOf(modifyingGobj);
			this[indexToModify] = modifyingGobj;
		}
		
		public function containsUniqueInPage(id:String):Boolean {
			for(var i:int = 0; i < this.length; i++) {
				var currObj:GraphicObject = this[i];
				if(id == currObj.getGraphicID()) return true;
			}
			return false;
		}
		
		public function containsInPage(modifyingGobj:GraphicObject):Boolean {
			return this.contains(modifyingGobj);
		}

	}
}