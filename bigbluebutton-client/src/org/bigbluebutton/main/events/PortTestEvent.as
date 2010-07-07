package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class PortTestEvent extends Event
	{
		public static const TEST_RTMP:String = "TEST_RTMP_CONNECTION";
		public static const TEST_RTMPT:String = "TEST_RTMPT_CONNECTION";
		
		public static const PORT_TEST_SUCCESS:String = "PORT_TEST_SUCESS";
		public static const PORT_TEST_FAILED:String = "PORT_TEST_FAILED";
		
		public static const TUNNELING_FAILED:String = "RTMTP_ALSO_FAILED";
		
		public var protocol:String;
		public var hostname:String;
		public var port:String;
		public var app:String;
		
		public function PortTestEvent(type:String)
		{
			super(type, true, false);
		}
	}
}