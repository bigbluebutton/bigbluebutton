package org.bigbluebutton.modules.present.controllers.maps
{
    import flash.events.IEventDispatcher;
    
    import org.bigbluebutton.common.IBbbModuleWindow;
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.common.events.OpenWindowEvent;
    import org.bigbluebutton.main.events.BBBEvent;
    import org.bigbluebutton.modules.present.models.PresentationConfigModel;
    import org.bigbluebutton.modules.present.ui.views.PresentationWindow;

    public class PresentationEventMapDelegate
    {
        public var configModel:PresentationConfigModel;
        
        private var _dispatcher:IEventDispatcher;
		private var presentWindow:PresentationWindow;

		
        public function PresentationEventMapDelegate(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public function callme():void {
            LogUtil.debug("CALLING ME!!!");
        }
        
        public function start():void {
            LogUtil.debug("***FOOOOO!!!!***");
            LogUtil.debug("OPTIONS [" + configModel.showWindowControls + ", " + configModel.presentationService + "]"); 
			if (presentWindow != null) return;
			presentWindow = new PresentationWindow();
			presentWindow.visible = configModel.showPresentWindow;
			presentWindow.showControls = configModel.showWindowControls;
			openWindow(presentWindow);

        }

		private function openWindow(window:IBbbModuleWindow):void{				
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = window;
			_dispatcher.dispatchEvent(event);		
		}
	
	}
}