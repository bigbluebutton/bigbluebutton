package org.bigbluebutton.modules.whiteboard.models
{
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.whiteboard.business.shapes.DrawObject;
	import org.bigbluebutton.modules.whiteboard.events.WhiteboardDrawEvent;

	public class WhiteboardModel
	{
		private var _presentation:ArrayCollection = new ArrayCollection();
		private var _currentPresentation:Presentation;
		
		private var _dispatcher:IEventDispatcher;
		
		public function WhiteboardModel(dispatcher:IEventDispatcher)
		{
			_dispatcher = dispatcher;
		}
		
		public function addAnnotation(annotation:DrawObject):void {
			_currentPresentation.addAnnotation(annotation);
		}
		
		public function removeAnnotation(id:String):void {
			
		}
		
		public function undo():void {
			_currentPresentation.undo();
	//		_dispatcher.dispatchEvent(new WhiteboardDrawEvent(WhiteboardDrawEvent.UNDO_SHAPE));
		}
		
		public function clear():void {
			_currentPresentation.clear();
			_dispatcher.dispatchEvent(new WhiteboardDrawEvent(WhiteboardDrawEvent.CLEAR_BOARD));
		}
	}
}