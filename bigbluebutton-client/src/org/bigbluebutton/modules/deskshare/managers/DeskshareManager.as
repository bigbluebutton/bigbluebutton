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
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.modules.deskshare.model.DeskshareOptions;
	import org.bigbluebutton.modules.deskshare.services.DeskshareService;
			
	public class DeskshareManager {		
		private var publishWindowManager:PublishWindowManager;
		private var viewWindowManager:ViewerWindowManager;
		private var toolbarButtonManager:ToolbarButtonManager;
		private var module:DeskShareModule;
		private var service:DeskshareService;
		private var globalDispatcher:Dispatcher;
		private var sharing:Boolean = false;
		
		public function DeskshareManager() {
			service = new DeskshareService();
			globalDispatcher = new Dispatcher();
			publishWindowManager = new PublishWindowManager(service);
			viewWindowManager = new ViewerWindowManager(service);	
			toolbarButtonManager = new ToolbarButtonManager();		
		}
		
		public function handleStartModuleEvent(module:DeskShareModule):void {
			LogUtil.debug("Deskshare Module starting");
			this.module = module;			
			service.handleStartModuleEvent(module);
      
      if (UsersUtil.amIPresenter()) {
        initDeskshare();
      }
      
		}
		
		public function handleStopModuleEvent():void {
			LogUtil.debug("Deskshare Module stopping");
			publishWindowManager.stopSharing();
			viewWindowManager.stopViewing();		
			service.disconnect();
		}
		
    public function handleStreamStoppedEvent():void {
      LogUtil.debug("Sending deskshare stopped command");
      service.stopSharingDesktop(module.getRoom(), module.getRoom());
    }
    
		public function handleStreamStartedEvent(videoWidth:Number, videoHeight:Number):void {
			LogUtil.debug("Sending startViewing command");
			service.sendStartViewingNotification(videoWidth, videoHeight);
		}
		    
		public function handleStartedViewingEvent(stream:String):void {
			LogUtil.debug("handleStartedViewingEvent [" + stream + "]");
			service.sendStartedViewingNotification(stream);
		}
		
    private function initDeskshare():void {
      sharing = false;
      var option:DeskshareOptions = new DeskshareOptions();
      option.parseOptions();
      if (option.autoStart) {
        handleStartSharingEvent(true);
      }
      if(option.showButton){
        toolbarButtonManager.addToolbarButton();
      }      
    }
    
		public function handleMadePresenterEvent(e:MadePresenterEvent):void {
			LogUtil.debug("Got MadePresenterEvent ");
      initDeskshare();
		}
		
		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			LogUtil.debug("Got MadeViewerEvent ");
			toolbarButtonManager.removeToolbarButton();
			if (sharing) {
				publishWindowManager.stopSharing();
			}
			sharing = false;
		}
		
		public function handleStartSharingEvent(autoStart:Boolean):void {
			LogUtil.debug("DeskshareManager::handleStartSharingEvent");
			//toolbarButtonManager.disableToolbarButton();
			toolbarButtonManager.startedSharing();
			var option:DeskshareOptions = new DeskshareOptions();
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
			LogUtil.debug("Received stop viewing command");		
			viewWindowManager.handleViewWindowCloseEvent();		
		}
					
		public function handleStreamStartEvent(videoWidth:Number, videoHeight:Number):void{
			if (sharing) return;
			LogUtil.debug("Received start vieweing command");
			viewWindowManager.startViewing(module.getRoom(), videoWidth, videoHeight);
		}
    
    
	}
}
