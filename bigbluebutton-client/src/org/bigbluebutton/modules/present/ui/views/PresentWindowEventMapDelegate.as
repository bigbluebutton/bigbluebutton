package org.bigbluebutton.modules.present.ui.views
{
    import flash.events.IEventDispatcher;
    
    import mx.managers.PopUpManager;
    
    import org.bigbluebutton.common.IBbbModuleWindow;
    import org.bigbluebutton.common.LogUtil;
    import org.bigbluebutton.common.events.OpenWindowEvent;
    import org.bigbluebutton.core.model.MeetingModel;
    import org.bigbluebutton.core.model.UsersModel;
    import org.bigbluebutton.modules.present.events.PresenterCommands;
    import org.bigbluebutton.modules.present.models.PresentationConfigModel;
    import org.bigbluebutton.modules.present.models.PresentationModel;
    import org.bigbluebutton.modules.present.ui.views.models.PresentWindowModel;

    public class PresentWindowEventMapDelegate
    {
        private var _dispatcher:IEventDispatcher;
        
        public var presentModel:PresentationModel;
        public var users:UsersModel;
        public var config:PresentationConfigModel;
        public var meeting:MeetingModel;
        
        private var _presentWindow:PresentWindow;
        private var _uploadWindow:FileUploadWindow;
        
        private var _model:PresentWindowModel = new PresentWindowModel();
        
        public function PresentWindowEventMapDelegate(dispatcher:IEventDispatcher)
        {
            _dispatcher = dispatcher;
        }
        
        public function start():void {
            if (_presentWindow != null) return;
            _presentWindow = new PresentWindow();
            _presentWindow.visible = config.showPresentWindow;
            _presentWindow.showControls = config.showWindowControls;
            _presentWindow.model = _model;
            
//            _model.presenter = meeting.amIPresenter();            
            openWindow(_presentWindow);
            
        }
        
        private function openWindow(window:IBbbModuleWindow):void {		
            LogUtil.debug("Opening upload window");
            var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
            event.window = window;
            _dispatcher.dispatchEvent(event);		
        }
        
        public function handleOpenUploadWindow():void {
            LogUtil.debug("HAndle open upload window event");
            if (_uploadWindow != null) return;
            
            _uploadWindow = new FileUploadWindow();
            _uploadWindow.presentationNames = presentModel.presentationNames;
            mx.managers.PopUpManager.addPopUp(_uploadWindow, _presentWindow, false);
        }
        
        public function handleCloseUploadWindow():void {
            PopUpManager.removePopUp(_uploadWindow);
            _uploadWindow = null;
        }
        
        public function handleGotoNextPageEvent():void {
            LogUtil.debug("Handle go to next page event");
            var curPage:int = presentModel.getCurrentPage();
             
            if ((curPage + 1) < presentModel.getCurrentPresentationNumberOfPages()) {
                _model.forwardBtnEnabled = true;
            } else {
                _model.forwardBtnEnabled = false;
            }
            _dispatcher.dispatchEvent(new PresenterCommands(PresenterCommands.GOTO_SLIDE, curPage + 1));
        }

        public function handleGotoPreviousPageEvent():void {
            LogUtil.debug("Handle go to previous page event");
            var curPage:int = presentModel.getCurrentPage();
            
            if ((curPage - 1) == 0) {
                _model.backBtnEnabled = true;
            } else {
                _model.backBtnEnabled = false;
            }
            
            _dispatcher.dispatchEvent(new PresenterCommands(PresenterCommands.GOTO_SLIDE, curPage - 1));
        }
        
        private function handlePresentationLoadedEvent():void {	
 ///           if (e.presentationName == currentPresentation) return;			
 //           currentPresentation = e.presentationName;
 //           presentationLoaded = true;
 //           slideView.setSlides(e.slides.slides);    		            		
 //           slideView.visible = true;		
            
 //           if (slideManager != null) slideManager.clear();	
 //           displaySlideNumber(slideView.selectedSlide + 1);	
 //           if (isPresenter) {
 //               //					displaySlideNavigationControls(true);					
 //               notifyOthersOfSharingPresentation(e.presentationName);
 //           } else {
 //               dispatchEvent(new SlideEvent(SlideEvent.LOAD_CURRENT_SLIDE));
 //           }
 //           onResetZoom();
        }
        
    }
}