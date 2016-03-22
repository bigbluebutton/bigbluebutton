package org.bigbluebutton.air.common.views {
	
	import flash.events.Event;
	
	public class SplitViewEvent extends Event {
		public static const CHANGE_VIEW:String = "changeView";
		
		public function SplitViewEvent(type:String, view:Class, details:Object, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.view = view;
			this.details = details;
		}
		
		public var view:Class;
		
		public var details:Object;
		
		override public function clone():Event {
			return new SplitViewEvent(type, view, details, bubbles, cancelable);
		}
	}
}
