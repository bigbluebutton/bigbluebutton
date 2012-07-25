package org.bigbluebutton.modules.whiteboard.models
{
	import mx.collections.ArrayCollection;

	public class Page
	{
		private var _num:int;
		private var _annotations:ArrayCollection = new ArrayCollection();
		
		public function Page(num:int)
		{
			_num = num;
		}
		
		public function addAnnotation(annotation:Annotation):void {
			_annotations.addItem(annotation);
		}
		
		public function undo():void {
			_annotations.removeItemAt(_annotations.length - 1);
		}
		
		public function clear():void {
			_annotations.removeAll();
		}
		
		public function get number():int {
			return _num;
		}
	}
}