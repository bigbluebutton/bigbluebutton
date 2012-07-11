package org.bigbluebutton.modules.whiteboard.managers
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;
	
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
			if(!containsUniqueInPage(gobj.getGraphicID()))
				this.addItem(gobj);
			else LogUtil.error("Adding previously existing item to page: " + gobj.getGraphicID());
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