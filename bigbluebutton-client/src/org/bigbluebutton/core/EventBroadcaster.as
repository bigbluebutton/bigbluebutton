package org.bigbluebutton.core
{
	import flash.events.EventDispatcher;
	
	public class EventBroadcaster extends EventDispatcher {
        private static var _instance:EventBroadcaster = new EventBroadcaster();

        public function EventBroadcaster() {
                if (_instance != null) {
                        trace ("Error: an instance of EventBroadcaster() already exists.");
                }
        }


        public static function getInstance():EventBroadcaster {
                return EventBroadcaster._instance;
        }
 	}
}