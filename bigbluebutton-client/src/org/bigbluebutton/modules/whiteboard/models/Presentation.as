package org.bigbluebutton.modules.whiteboard.models
{	
	import mx.collections.ArrayCollection;
	import org.bigbluebutton.modules.whiteboard.business.shapes.GraphicObject;

	public class Presentation
	{
		private var _id:String;
		private var _numPages:int;
		
		private var _pages:ArrayCollection = new ArrayCollection();
		private var _currentPage:Page;
		
		public function Presentation(id:String, numPages:int)
		{
			_id = id;
			_numPages = numPages;
		}
		
		private function createPages(numPages:int):void {
			for (var i:int = 1; i <= numPages; i++) {
				_pages.addItem(new Page(i));
			}
		}
		
		public function setCurrentPage(num:int):void {
			for (var i:int = 1; i <= _numPages; i++) {
				_pages.addItem(new Page(i));
			}			
		}
		
		public function addAnnotation(annotation:GraphicObject):void {
			_currentPage.addAnnotation(annotation);
		}
		
		public function undo():void {
			_currentPage.undo();
		}
		
		public function clear():void {
			_currentPage.clear();
		}
		
		public function get id():String {
			return _id;
		}
	}
}