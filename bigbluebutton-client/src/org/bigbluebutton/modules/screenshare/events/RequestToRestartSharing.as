package org.bigbluebutton.modules.screenshare.events 
{
	import flash.events.Event;
	
    public class RequestToRestartSharing extends Event 
    {
        
        public static const REQUEST_SHARE_RESTART:String = "screenshare request to restart sharing event";
        
        public function RequestToRestartSharing() 
        {
            super(REQUEST_SHARE_RESTART, true, false);
        }
        
    }

}