package org.bigbluebutton.main.events
{
	import flash.events.Event;
	
	import mx.containers.Canvas;
	
	public class AddHighligtherCanvasEvent extends Event
	{
		public static const ADD_HIGHLIGHTER_CANVAS:String = "addHighlighterCanvas";
		
		public var canvas:Canvas;
		
		public function AddHighligtherCanvasEvent(type:String, bubbles:Boolean = true, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

	}
}