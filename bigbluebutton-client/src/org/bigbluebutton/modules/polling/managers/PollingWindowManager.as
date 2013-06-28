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
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.FocusEvent;
	import flash.events.IEventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
	import mx.collections.ArrayCollection;
	import mx.managers.IFocusManager;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.polling.events.GenerateWebKeyEvent;
	import org.bigbluebutton.modules.polling.events.OpenPollMainWindowEvent;
	import org.bigbluebutton.modules.polling.events.OpenSavedPollEvent;
	import org.bigbluebutton.modules.polling.events.PollGetTitlesEvent;
	import org.bigbluebutton.modules.polling.events.PollRefreshEvent;
	import org.bigbluebutton.modules.polling.events.PollingInstructionsWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollingStatsWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollingStatusCheckEvent;
	import org.bigbluebutton.modules.polling.events.PollingViewWindowEvent;
	import org.bigbluebutton.modules.polling.events.ReviewResultsEvent;
	import org.bigbluebutton.modules.polling.events.StopPollEvent;
	import org.bigbluebutton.modules.polling.model.PollObject;
	import org.bigbluebutton.modules.polling.model.PollingModel;
	import org.bigbluebutton.modules.polling.model.PollingViewModel;
	import org.bigbluebutton.modules.polling.service.PollingService;
	import org.bigbluebutton.modules.polling.views.CreatePollWindow;
	import org.bigbluebutton.modules.polling.views.PollCreateWindow;
	import org.bigbluebutton.modules.polling.views.PollMainWindow;
	import org.bigbluebutton.modules.polling.views.PollingInstructionsWindow;
	import org.bigbluebutton.modules.polling.views.DisplayResultWindow;
	import org.bigbluebutton.modules.polling.views.PollingStatsWindow;
	import org.bigbluebutton.modules.polling.views.PollingViewWindow;
	import org.bigbluebutton.modules.polling.views.TakePollWindow;
	import org.bigbluebutton.modules.polling.views.UpdatePollWindow;

	public class PollingWindowManager {	
		
    // Injected by Mate
    public var model:PollingModel;
    public var dispatcher:IEventDispatcher;
    
    private var _viewModel:PollingViewModel;
    
		private var pollingWindow:PollingViewWindow;
		private var statsWindow:PollingStatsWindow;
    private var updatePollWindow:UpdatePollWindow;
    private var takePollWindow:TakePollWindow;
		private var pollMainWindow:PollMainWindow = new PollMainWindow();
    private var createPollWindow:CreatePollWindow;

		private var displayResultWindow:DisplayResultWindow;

    private var testCreateWindow:PollCreateWindow;
		private var service:PollingService;
		private var isViewing:Boolean = false;
		
		private var votingOpen:Boolean = false;
		
		public var appFM:IFocusManager;
		
		private var instructionsFocusTimer:Timer = new Timer(250);
		private var statsFocusTimer:Timer = new Timer(250);
		
		public static const LOG:String = "[Polling::PollingWindowManager] ";
		
		public function initialize():void {
      _viewModel = new PollingViewModel(model);
		}
				
		public function handleOpenPollMainWindowEvent():void{
      if (_viewModel == null) trace("***************** PollingWindowManager::handleOpenPollMainWindowEvent - viewModel is NULL!!!!!"); 
      pollMainWindow.viewModel = _viewModel;      
			openWindow(pollMainWindow);     
		}
		
		private function moveInstructionsFocus(event:TimerEvent):void{
			appFM.setFocus(updatePollWindow.titleBarOverlay);
			instructionsFocusTimer.stop();
		}
		
		public function handleOpenPollingInstructionsWindowWithExistingPoll(e:OpenSavedPollEvent):void{

      updatePollWindow = new UpdatePollWindow();
      	
			openWindow(updatePollWindow);
			
			instructionsFocusTimer.addEventListener(TimerEvent.TIMER, moveInstructionsFocus);
			instructionsFocusTimer.start();
		}
		
		public function handleClosePollingInstructionsWindow(e:PollingInstructionsWindowEvent):void{
			closeWindow(updatePollWindow);
		}
		
		// Checking the polling status to prevent a presenter from publishing two polls at a time
		  public function handleCheckStatusEvent(e:PollingStatusCheckEvent):void{

		  }
		  
		  public function handleCheckTitlesInInstructions(e:PollGetTitlesEvent):void{
//			  instructionsWindow.invalidTitles = e.titleList;
		  }
		  
		  public function handleReturnWebKeyEvent(e:GenerateWebKeyEvent):void
		  {
		  	  var transferURL:String = e.webHostIP + "/p/" + e.poll.webKey;
		  	  LogUtil.debug("Returning poll URL to Statistics window: " + transferURL);			  
			  statsWindow.webPollUrl = transferURL;

			  statsWindow.setUrlBoxText();


		  }

		// Action makers (function that actually act on the windows )
		//#############################################################################
		private function openWindow(window:IBbbModuleWindow):void{
			var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			windowEvent.window = window;
			if (windowEvent.window != null)
				dispatcher.dispatchEvent(windowEvent);
		}
		
		private function closeWindow(window:IBbbModuleWindow):void{
			var windowEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			windowEvent.window = window;
      dispatcher.dispatchEvent(windowEvent);
		}
		//#################################################################################


		// PollingViewWindow.mxml Window Handlers 
		//#########################################################################
		public function handleOpenPollingViewWindow(e:PollingViewWindowEvent):void{
			if (!votingOpen){
				votingOpen = true;
				pollingWindow = new PollingViewWindow();
				pollingWindow.title = e.poll.title;
				pollingWindow.question = e.poll.question;
				pollingWindow.isMultiple = e.poll.isMultiple;
				pollingWindow.answers = e.poll.answers;
				openWindow(pollingWindow);
			}
		}
		
		public function handleClosePollingViewWindow(e:PollingViewWindowEvent):void{
			votingOpen = false;
			closeWindow(pollingWindow);
		}
		
		public function handleStopPolling(e:StopPollEvent):void{

		}
		//##########################################################################
		
		
		// PollingStatsWindow.mxml Window Handlers 
		//#########################################################################
		public function handleOpenPollingStatsWindow(e:PollingStatsWindowEvent):void{
			//statsWindow = new PollingStatsWindow();
			//statsWindow.trackingPoll = e.poll;

			displayResultWindow = new DisplayResultWindow();
			openWindow(displayResultWindow);

			
			//statsFocusTimer.addEventListener(TimerEvent.TIMER, focusStatsWindow);
			//statsFocusTimer.start();
		}
		
		private function focusStatsWindow(event:TimerEvent):void{
			statsWindow.focusManager.setFocus(statsWindow.titleBarOverlay);
			statsFocusTimer.stop();
		}
		
		public function handleClosePollingStatsWindow(e:PollingStatsWindowEvent):void{
			closeWindow(statsWindow);
		}
		
		public function handleRefreshPollingStatsWindow(e:PollRefreshEvent):void{
			statsWindow.refreshWindow(e.poll.votes, e.poll.totalVotes, e.poll.didNotVote);
		}
		
		public function handleReviewResultsEvent(e:ReviewResultsEvent):void{
			statsWindow = new PollingStatsWindow();
			statsWindow.trackingPoll = e.poll;
			statsWindow.viewingClosedPoll = true;
			statsWindow.reviewing = true;
			openWindow(statsWindow);
		}
		//##########################################################################
	}
}
