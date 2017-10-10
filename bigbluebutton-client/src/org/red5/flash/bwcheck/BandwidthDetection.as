package org.red5.flash.bwcheck
{
	import flash.events.EventDispatcher;
	import flash.net.NetConnection;
	
	import org.red5.flash.bwcheck.events.BandwidthDetectEvent;
	
	[Event(name=BandwidthDetectEvent.DETECT_STATUS, type="org.red5.flash.bwcheck.events.BandwidthDetectEvent")]
	[Event(name=BandwidthDetectEvent.DETECT_COMPLETE, type="org.red5.flash.bwcheck.events.BandwidthDetectEvent")]
	
	public class BandwidthDetection extends EventDispatcher
	{
		protected var nc:NetConnection;
		
		public function BandwidthDetection()
		{
			
		}
		
		protected function dispatch(info:Object, eventName:String):void
		{
			var event:BandwidthDetectEvent = new BandwidthDetectEvent(eventName);
			event.info = info;
			dispatchEvent(event);
		}
		
		protected function dispatchStatus(info:Object):void
		{
			var event:BandwidthDetectEvent = new BandwidthDetectEvent(BandwidthDetectEvent.DETECT_STATUS);
			event.info = info;
			dispatchEvent(event);
		}
		
		protected function dispatchComplete(info:Object):void
		{
			var event:BandwidthDetectEvent = new BandwidthDetectEvent(BandwidthDetectEvent.DETECT_COMPLETE);
			event.info = info;
			dispatchEvent(event);
		}
		
		protected function dispatchFailed(info:Object):void
		{
			var event:BandwidthDetectEvent = new BandwidthDetectEvent(BandwidthDetectEvent.DETECT_FAILED);
			event.info = info;
			dispatchEvent(event);
		}
		
		public function set connection(connect:NetConnection):void
		{
			nc = connect;
		}

	}
}