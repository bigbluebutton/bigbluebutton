package org.bigbluebutton.modules.screenshare.events 
{
    import flash.events.Event;
    
    public class ScreenSharePausedEvent extends Event 
    {
        public static const SCREENSHARE_PAUSED:String = "screenshare share paused event";
    
        public var session:String;
    
        public function ScreenSharePausedEvent(session: String) 
        {
            super(SCREENSHARE_PAUSED, true, false);
            this.session = session;
        }
        
    }

}