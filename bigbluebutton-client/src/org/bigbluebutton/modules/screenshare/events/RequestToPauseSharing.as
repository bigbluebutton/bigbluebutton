package org.bigbluebutton.modules.screenshare.events 
{
	import flash.events.Event;
	
    public class RequestToPauseSharing extends Event 
    {
        
        public static const REQUEST_SHARE_PAUSE:String = "screenshare request to pause sharing event";
        
        public function RequestToPauseSharing() 
        {
            super(REQUEST_SHARE_PAUSE, true, false);
        }
        
    }

}