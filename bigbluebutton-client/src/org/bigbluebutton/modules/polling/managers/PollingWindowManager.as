/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.modules.polling.managers
{	
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.IBbbModuleWindow;
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.common.events.CloseWindowEvent;
  import org.bigbluebutton.common.events.OpenWindowEvent;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.modules.polling.events.GetPollsEvent;
  import org.bigbluebutton.modules.polling.events.OpenSavedPollEvent;
  import org.bigbluebutton.modules.polling.events.PollEvent;
  import org.bigbluebutton.modules.polling.events.PollMainWindowEvent;
  import org.bigbluebutton.modules.polling.events.PollResultWindowEvent;
  import org.bigbluebutton.modules.polling.events.PollUpdateWindowEvent;
  import org.bigbluebutton.modules.polling.events.StopPollEvent;
  import org.bigbluebutton.modules.polling.events.TakePollWindowEvent;
  import org.bigbluebutton.modules.polling.model.PollingModel;
  import org.bigbluebutton.modules.polling.model.PollingViewModel;
  import org.bigbluebutton.modules.polling.service.PollingService;
  import org.bigbluebutton.modules.polling.views.CreatePollWindow;
  import org.bigbluebutton.modules.polling.views.DisplayResultWindow;
  import org.bigbluebutton.modules.polling.views.PollCreateWindow;
  import org.bigbluebutton.modules.polling.views.PollMainWindow;
  import org.bigbluebutton.modules.polling.views.TakePollWindow;
  import org.bigbluebutton.modules.polling.views.UpdatePollWindow;

	public class PollingWindowManager {	
    private static const LOG:String = "Poll::PollingWindowManager - ";
		
		// Injected by Mate
		public var model:PollingModel;
		public var dispatcher:IEventDispatcher;
		
		private var _viewModel:PollingViewModel;
		
		private var updatePollWindow:UpdatePollWindow;
		private var takePollWindow:TakePollWindow;
		private var pollMainWindow:PollMainWindow;
		private var createPollWindow:CreatePollWindow = new CreatePollWindow();
		private var resultsWindow:DisplayResultWindow;
    private var toolbarButtonManager:ToolbarButtonManager = new ToolbarButtonManager();
			
		public function initialize():void {
      trace(LOG + " initialized.");
			_viewModel = new PollingViewModel(model);
      if (UsersUtil.amIPresenter()) {
        toolbarButtonManager.addToolbarButton();
      }
      initializeModel();
		}
		
    private function initializeModel():void {
      trace(LOG + " initializing model.");
      if (! model.initialized()) {
        dispatcher.dispatchEvent(new GetPollsEvent());
      }
    }
    
    public function handleMadePresenterEvent(e:MadePresenterEvent):void{
      toolbarButtonManager.addToolbarButton();
      initializeModel();
    }
    
    public function handleMadeViewerEvent(e:MadePresenterEvent):void{
      toolbarButtonManager.removeToolbarButton();
      initializeModel();
    }
    
		public function handleOpenPollMainWindowEvent():void {
      toolbarButtonManager.disableToolbarButton();
      pollMainWindow = new PollMainWindow();
			pollMainWindow.viewModel = _viewModel;      
			openWindow(pollMainWindow);     
		}
    
    public function handleClosePollMainWindowEvent():void {
      toolbarButtonManager.enableToolbarButton();
      closeWindow(pollMainWindow);
    }

    public function handleOpenCreatePollWindowEvent():void {
      openWindow(createPollWindow);  
    }
    
    public function handleCloseEditPollEvent():void {
      closeWindow(updatePollWindow);
    }
    
    public function handleCloseCreatePollWindowEvent():void {
      closeWindow(createPollWindow);
    }
    
    public function handleClosePollResultWindowEvent():void {
      closeWindow(resultsWindow);  
    }
    
    public function handlePollStartedEvent(event:PollEvent):void {
      if (UsersUtil.amIModerator() || UsersUtil.amIPresenter()) {
        openPollResultsWindow(event.pollID);
      } else {
        openTakePollWindow(event.pollID);
      }
    }
    
    public function handlePollStoppedEvent(event:PollEvent):void {
      if (! UsersUtil.amIModerator() && ! UsersUtil.amIPresenter()) {
        if (! _viewModel.hasUserResponded(event.pollID)) {
          closeWindow(takePollWindow);
          openPollResultsWindow(event.pollID);
        }
      }
    }
    
    public function handleUserRespondedEvent(event:PollEvent):void {
      openPollResultsWindow(event.pollID);
    }
    
		public function handleCloseTakePollWindowEvent():void {
      closeWindow(takePollWindow);
		}
		
    private function openTakePollWindow(pollID:String):void {
      takePollWindow =  new TakePollWindow();
      takePollWindow.viewModel = _viewModel;
      takePollWindow.pollID = pollID;
      
      openWindow(takePollWindow);      
    }
    
    private function openPollResultsWindow(pollID:String):void {
      resultsWindow  = new DisplayResultWindow();
      resultsWindow.viewModel = _viewModel;
      resultsWindow.pollID = pollID;
      
      openWindow(resultsWindow);      
    }
    
    public function handleOpenPollResultWindowEvent(event:PollEvent):void {
      openPollResultsWindow(event.pollID);
    }
		
    public function handleEditPollRequestEvent(event:PollEvent):void {
      updatePollWindow = new UpdatePollWindow();
      updatePollWindow.viewModel = _viewModel;
      updatePollWindow.pollID = event.pollID;
      
      openWindow(updatePollWindow);
    }
    

		private function openWindow(window:IBbbModuleWindow):void {
			var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			windowEvent.window = window;
			if (windowEvent.window != null)
				dispatcher.dispatchEvent(windowEvent);
		}
		
		private function closeWindow(window:IBbbModuleWindow):void {
			var windowEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			windowEvent.window = window;
      dispatcher.dispatchEvent(windowEvent);
		}

	}
}
