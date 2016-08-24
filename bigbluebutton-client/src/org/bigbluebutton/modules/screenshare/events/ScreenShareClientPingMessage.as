package org.bigbluebutton.modules.screenshare.events 
{
	import flash.events.Event;
	

    public class ScreenShareClientPingMessage extends Event 
    {
        public static const CLIENT_PING:String = "screenshare client ping message";
        
        public var streamId: String;
        public var timestamp: Number;
        
        public function ScreenShareClientPingMessage(streamId: String, timestamp: Number) 
        {
            super(CLIENT_PING, true, false);
            this.streamId = streamId;
            this.timestamp = timestamp;
			
        }
        
    }

}