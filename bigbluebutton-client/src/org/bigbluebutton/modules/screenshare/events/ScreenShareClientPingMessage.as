package org.bigbluebutton.modules.screenshare.events 
{
	import flash.events.Event;
	

    public class ScreenShareClientPingMessage extends Event 
    {
        public static const CLIENT_PING:String = "screenshare client ping message";
        
        public var session: String;
        public var timestamp: Number;
        
        public function ScreenShareClientPingMessage(session: String, timestamp: Number) 
        {
            super(CLIENT_PING, true, false);
            this.session = session;
            this.timestamp = timestamp;
			
        }
        
    }

}