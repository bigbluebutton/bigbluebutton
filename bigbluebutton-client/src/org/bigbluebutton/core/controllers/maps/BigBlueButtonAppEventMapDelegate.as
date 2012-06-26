package org.bigbluebutton.core.controllers.maps
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.common.LogUtil;

    public class BigBlueButtonAppEventMapDelegate
    {
        public var dispatcher:IEventDispatcher;
        
        public function BigBlueButtonAppEventMapDelegate(dispatcher:IEventDispatcher)
        {
            this.dispatcher = dispatcher;
        }
        
        public function loadConfig():void {
            LogUtil.debug("*********************** Load Config !!!!!!!!!!!!!!!!!!!!!!!! ****");
        }
    }
}