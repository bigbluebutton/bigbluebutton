package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	import mx.containers.Canvas;
	
	public class AddOverlayCanvasEvent extends Event
	{
		public static const ADD_OVERLAY_CANVAS:String = "ADD_OVERLAY_CANVAS";
		
		public var canvas:Canvas;
		
		public function AddOverlayCanvasEvent(type:String)
		{
			super(type, true, false);
		}

	}
}