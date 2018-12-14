package org.bigbluebutton.modules.screenshare.events {
	import flash.events.Event;
	
	public class ScreenshareSelectionWindowEvent extends Event {
		public static const SHOW_WINDOW:String = "SHOW SCREENSHARE SELECTION WINDOW";
		public static const HIDE_WINDOW:String = "HIDE SCREENSHARE SELECTION WINDOW";
		
		public function ScreenshareSelectionWindowEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}