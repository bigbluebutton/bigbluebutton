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

package org.bigbluebutton.modules.deskshare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.deskshare.model.DeskshareOptions;
	import org.bigbluebutton.modules.deskshare.services.DeskshareService;
			
	public class DeskshareManager {		
		private static const LOGGER:ILogger = getClassLogger(DeskshareManager);

		private var publishWindowManager:PublishWindowManager;
		private var viewWindowManager:ViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:DeskShareModule;
		private var service:DeskshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;
		private var autoStart:Boolean = false;
		
		public function DeskshareManager() {
			service = new DeskshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new PublishWindowManager(service);
			viewWindowManager = new ViewerWindowManager(service);	
			toolbarButtonManager = new ToolbarButtonManager();		
		}
		
		public function handleStartModuleEvent(module:DeskShareModule):void {
			LOGGER.debug("Deskshare Module starting");
			this.module = module;			
			service.handleStartModuleEvent(module);
      
      if (UsersUtil.amIPresenter()) {
        initDeskshare();
      }
      
		}
		
		public function handleStopModuleEvent():void {
			LOGGER.debug("Deskshare Module stopping");
			publishWindowManager.stopSharing();
			viewWindowManager.stopViewing();		
			service.disconnect();
		}
		
    public function handleStreamStoppedEvent():void {
	  LOGGER.debug("Sending deskshare stopped command");
      service.stopSharingDesktop(module.getRoom(), module.getRoom());
    }
    
		public function handleStreamStartedEvent(videoWidth:Number, videoHeight:Number):void {
			LOGGER.debug("Sending startViewing command");
			service.sendStartViewingNotification(videoWidth, videoHeight);
		}
		    
		public function handleStartedViewingEvent(stream:String):void {
			LOGGER.debug("handleStartedViewingEvent [{0}]", [stream]);
			service.sendStartedViewingNotification(stream);
		}
		
    private function initDeskshare():void {
      sharing = false;
      var option:DeskshareOptions = new DeskshareOptions();
      option.parseOptions();
      autoStart = option.autoStart;
    }
    
		public function handleMadePresenterEvent(e:MadePresenterEvent):void {
			LOGGER.debug("Got MadePresenterEvent ");
      initDeskshare();
		}
		
		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			sharing = false;
		}
		
		public function handleStartSharingEvent():void {
			LOGGER.debug("DeskshareManager::handleStartSharingEvent");

			//toolbarButtonManager.disableToolbarButton();
			toolbarButtonManager.startedSharing();
			var option:DeskshareOptions = new DeskshareOptions();
			option.parseOptions();
			publishWindowManager.startSharing(option.publishURI , option.useTLS , module.getRoom(), autoStart, option.autoFullScreen);
			sharing = true;
		}

		public function handleShareScreenEvent(fullScreen:Boolean):void {
			publishWindowManager.handleShareScreenEvent(fullScreen);
		}

		public function handleStopSharingEvent():void {
			sharing = false;
			publishWindowManager.stopSharing();
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
					
		public function handleStreamStartEvent(videoWidth:Number, videoHeight:Number):void{
			LOGGER.debug("Received start vieweing command");
			viewWindowManager.startViewing(module.getRoom(), videoWidth, videoHeight);
		}

		public function handleStopViewStreamEvent():void{
			viewWindowManager.stopViewing();
			if(UsersUtil.amIPresenter())
			   publishWindowManager.stopSharing();
		}

		public function handleVideoDisplayModeEvent(actualSize:Boolean):void{
			viewWindowManager.handleVideoDisplayModeEvent(actualSize);
		}
    
		//Desktop Publish Events Handlers
		public function handleAppletStarted(videoWidth:Number, videoHeight:Number):void{
			if(UsersUtil.amIPresenter())
			   publishWindowManager.handleAppletStarted(videoWidth,videoHeight);
		}

		public function handleDeskshareAppletLaunchedEvent():void{
			if(UsersUtil.amIPresenter())
			   publishWindowManager.handleDeskshareAppletLaunchedEvent();
		}

	}
}
