package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.common.IBbbCanvas;
	
	public class AddOverlayCanvasEvent extends Event
	{
		public static const ADD_OVERLAY_CANVAS:String = "ADD_OVERLAY_CANVAS";
		
		public var canvas:IBbbCanvas;
		
		public function AddOverlayCanvasEvent(type:String)
		{
			super(type, true, false);
		}

	}
}