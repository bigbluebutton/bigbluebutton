package org.bigbluebutton.modules.whiteboard.events {
	import flash.events.Event;
	
	import org.bigbluebutton.modules.whiteboard.views.IWhiteboardReceiver;
	
	public class RequestNewCanvasEvent extends Event {
		public static const REQUEST_NEW_CANVAS:String = "request_new_whiteboard_canvas";
		
		public var receivingObject:IWhiteboardReceiver;
		
		public function RequestNewCanvasEvent(ro:IWhiteboardReceiver) {
			super(REQUEST_NEW_CANVAS, false, false);
			receivingObject = ro;
		}
	}
}