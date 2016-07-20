/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.modules.screenshare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.screenshare.events.IsSharingScreenEvent;
	import org.bigbluebutton.modules.screenshare.events.ShareStartRequestResponseEvent;
	import org.bigbluebutton.modules.screenshare.events.StartShareRequestFailedEvent;
	import org.bigbluebutton.modules.screenshare.events.StartShareRequestSuccessEvent;
	import org.bigbluebutton.modules.screenshare.events.StreamStartedEvent;
	import org.bigbluebutton.modules.screenshare.events.ViewStreamEvent;
	import org.bigbluebutton.modules.screenshare.model.ScreenshareModel;
	import org.bigbluebutton.modules.screenshare.model.ScreenshareOptions;
	import org.bigbluebutton.modules.screenshare.services.ScreenshareService;
			
	public class ScreenshareManager {		
    private static const LOGGER:ILogger = getClassLogger(ScreenshareManager);
    
		private var publishWindowManager:PublishWindowManager;
		private var viewWindowManager:ViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:ScreenshareModule;
		private var service:ScreenshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;
   
		public function ScreenshareManager() {
			service = new ScreenshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new PublishWindowManager(service);
			viewWindowManager = new ViewerWindowManager(service);	
			toolbarButtonManager = new ToolbarButtonManager();		
		}
		
		public function handleStartModuleEvent(module:ScreenshareModule):void {
      LOGGER.debug("Screenshare Module starting");
			this.module = module;			
			service.handleStartModuleEvent(module);
      
      if (UsersUtil.amIPresenter()) {
        initDeskshare();
      }      
		}
		
		public function handleStopModuleEvent():void {
      LOGGER.debug("Screenshare Module stopping");
			publishWindowManager.stopSharing();
			viewWindowManager.stopViewing();		
			service.disconnect();
		}
		
    public function handleConnectionSuccessEvent():void {
      LOGGER.debug("handle Connection Success Event");
      service.checkIfPresenterIsSharingScreen();  
    }
    
    public function handleStreamStoppedEvent():void {
      LOGGER.debug("Sending deskshare stopped command");
      service.stopSharingDesktop(module.getRoom(), module.getRoom());
    }
    
		public function handleStreamStartedEvent(event: StreamStartedEvent):void {
      ScreenshareModel.getInstance().streamId = event.streamId;
      ScreenshareModel.getInstance().width = event.width;
      ScreenshareModel.getInstance().height = event.height;
      ScreenshareModel.getInstance().url = event.url;
      
      if (UsersUtil.amIPresenter()) {
//        var dispatcher:Dispatcher = new Dispatcher();
//        dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));        
      } else {
        handleStreamStartEvent(ScreenshareModel.getInstance().streamId, event.width, event.height);
      }
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));
		}

		public function handleIsSharingScreenEvent(event: IsSharingScreenEvent):void {
			ScreenshareModel.getInstance().streamId = event.streamId;
			ScreenshareModel.getInstance().width = event.width;
			ScreenshareModel.getInstance().height = event.height;
			ScreenshareModel.getInstance().url = event.url;
			
			if (UsersUtil.amIPresenter()) {
//				var dispatcher:Dispatcher = new Dispatcher();
//				dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));        
			} else {
				handleStreamStartEvent(ScreenshareModel.getInstance().streamId, event.width, event.height);
        
			}
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new ViewStreamEvent(ViewStreamEvent.START));  
		}
		
		
		public function handleStartedViewingEvent(stream:String):void {
      LOGGER.debug("handleStartedViewingEvent [" + stream + "]");
			service.sendStartedViewingNotification(stream);
		}
		
    private function initDeskshare():void {
      sharing = false;
      var option:ScreenshareOptions = new ScreenshareOptions();
      option.parseOptions();
      if (option.autoStart) {
        handleStartSharingEvent(true);
      }
      if(option.showButton){
        toolbarButtonManager.addToolbarButton();
      }      
    }
    
		public function handleMadePresenterEvent(e:MadePresenterEvent):void {
      LOGGER.debug("Got MadePresenterEvent ");
      initDeskshare();
		}
		
		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
      LOGGER.debug("Got MadeViewerEvent ");
			toolbarButtonManager.removeToolbarButton();
			if (sharing) {
				service.requestStopSharing(ScreenshareModel.getInstance().streamId);
				publishWindowManager.stopSharing();
			}
			sharing = false;
		}
		
    public function handleRequestStartSharingEvent():void {
      toolbarButtonManager.startedSharing();
      var option:ScreenshareOptions = new ScreenshareOptions();
      option.parseOptions();
      var autoStart:Boolean = false; // harcode for now
      publishWindowManager.startSharing(module.getCaptureServerUri(), module.getRoom(), autoStart, option.autoFullScreen);
      sharing = true;
      service.requestStartSharing();
    }
    
    public function handleRequestStopSharingEvent():void {
      service.requestStopSharing(ScreenshareModel.getInstance().streamId);
    }
    
    public function handleShareStartRequestResponseEvent(event:ShareStartRequestResponseEvent):void {
      LOGGER.debug("handleShareStartRequestResponseEvent");
      var dispatcher:Dispatcher = new Dispatcher();
      if (event.success) {
        ScreenshareModel.getInstance().authToken = event.token;
        ScreenshareModel.getInstance().jnlp = event.jnlp;
        dispatcher.dispatchEvent(new StartShareRequestSuccessEvent(ScreenshareModel.getInstance().authToken));
      } else {
        dispatcher.dispatchEvent(new StartShareRequestFailedEvent());        
      }
    }
    
		public function handleStartSharingEvent(autoStart:Boolean):void {
      LOGGER.debug("handleStartSharingEvent");
			//toolbarButtonManager.disableToolbarButton();
			toolbarButtonManager.startedSharing();
			var option:ScreenshareOptions = new ScreenshareOptions();
			option.parseOptions();
			publishWindowManager.startSharing(module.getCaptureServerUri(), module.getRoom(), autoStart, option.autoFullScreen);
			sharing = true;
		}
		
		public function handleShareWindowCloseEvent():void {
			//toolbarButtonManager.enableToolbarButton();
			publishWindowManager.handleShareWindowCloseEvent();
			sharing = false;
			toolbarButtonManager.stopedSharing();
		}
					
		public function handleViewWindowCloseEvent():void {
      LOGGER.debug("Received stop viewing command");		
			viewWindowManager.handleViewWindowCloseEvent();		
		}
					
		private function handleStreamStartEvent(streamId: String, videoWidth:Number, videoHeight:Number):void{
      LOGGER.debug("Received start vieweing command");
			viewWindowManager.startViewing(streamId, videoWidth, videoHeight);
		}
    
    
	}
}
