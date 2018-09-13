package org.bigbluebutton.core.events {
	import flash.events.Event;

	public class UpdateRecordingTimerEvent extends Event {

		public static const UPDATE_TIMER:String = "UPDATE_TIMER";

		public var time:int;

		public function UpdateRecordingTimerEvent(time:int) {
			super(UPDATE_TIMER, false, false);
			this.time = time;
		}
	}
}
