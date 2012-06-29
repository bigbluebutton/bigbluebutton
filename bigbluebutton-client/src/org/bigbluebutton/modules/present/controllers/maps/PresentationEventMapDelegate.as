package org.bigbluebutton.modules.present.controllers.maps
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.main.events.BBBEvent;
    import org.bigbluebutton.modules.present.models.PresentationConfigModel;

    public class PresentationEventMapDelegate
    {
        public var configModel:PresentationConfigModel;
        
        private var _dispatcher:IEventDispatcher;
        
        public function PresentationEventMapDelegate(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public function start():void {
            LogUtil.debug("***FOOOOO!!!!***");
            LogUtil.debug("OPTIONS " + configModel.showWindowControls); 
        }
    }
}