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
	
	import mx.collections.ArrayCollection;
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	
	import org.bigbluebutton.modules.polling.service.PollingService;
	
	import org.bigbluebutton.modules.polling.views.PollingViewWindow;
	import org.bigbluebutton.modules.polling.views.PollingStatsWindow;
	import org.bigbluebutton.modules.polling.views.PollingInstructionsWindow;
	
	import org.bigbluebutton.modules.polling.events.PollingViewWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollingInstructionsWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollingStatsWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollRefreshEvent;
	import org.bigbluebutton.modules.polling.events.StopPollEvent;
	import org.bigbluebutton.modules.polling.events.PollingStatusCheckEvent;
	import org.bigbluebutton.modules.polling.events.PollGetTitlesEvent;
	import org.bigbluebutton.modules.polling.events.OpenSavedPollEvent;
	import org.bigbluebutton.modules.polling.events.ReviewResultsEvent;
	import org.bigbluebutton.modules.polling.events.GenerateWebKeyEvent;
	
	import mx.managers.IFocusManager;
	import flash.utils.Timer;
	import flash.events.TimerEvent;
	import flash.events.FocusEvent;
	
	import org.bigbluebutton.modules.polling.model.PollObject;
			
	public class PollingWindowManager {	
			
		private var pollingWindow:PollingViewWindow;
		private var statsWindow:PollingStatsWindow;
		private var instructionsWindow:PollingInstructionsWindow;
		private var service:PollingService;
		private var isViewing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		private var votingOpen:Boolean = false;
		
		public var appFM:IFocusManager;
		
		private var instructionsFocusTimer:Timer = new Timer(250);
		private var statsFocusTimer:Timer = new Timer(250);
		
		public static const LOGNAME:String = "[Polling::PollingWindowManager] ";
		
		public function PollingWindowManager(service:PollingService) {
		  LogUtil.debug(LOGNAME +" Built PollingWindowManager");	
		  this.service = service;
		  globalDispatcher = new Dispatcher();
		}
				
		//PollingInstructionsWindow.mxml Window Event Handlerscx 
		//##########################################################################
		public function handleOpenPollingInstructionsWindow(e:PollingInstructionsWindowEvent):void{
			instructionsWindow = new PollingInstructionsWindow();
			// Use the PollGetTitlesEvent to fetch a list of already-used titles
			var getTitlesEvent:PollGetTitlesEvent = new PollGetTitlesEvent(PollGetTitlesEvent.CHECK);
			globalDispatcher.dispatchEvent(getTitlesEvent);
			openWindow(instructionsWindow);
			
			instructionsFocusTimer.addEventListener(TimerEvent.TIMER, moveInstructionsFocus);
			instructionsFocusTimer.start();
		}
		
		private function moveInstructionsFocus(event:TimerEvent):void{
			appFM.setFocus(instructionsWindow.titleBarOverlay);
			instructionsFocusTimer.stop();
		}
		
		public function handleOpenPollingInstructionsWindowWithExistingPoll(e:OpenSavedPollEvent):void{
			instructionsWindow = new PollingInstructionsWindow();
			// Use the PollGetTitlesEvent to fetch a list of already-used titles
			var getTitlesEvent:PollGetTitlesEvent = new PollGetTitlesEvent(PollGetTitlesEvent.CHECK);
			globalDispatcher.dispatchEvent(getTitlesEvent);
			if (e.poll != null){
				instructionsWindow.incomingPoll = new PollObject();
				instructionsWindow.incomingPoll = e.poll;
				instructionsWindow.editing = true;
			}		
			openWindow(instructionsWindow);
			
			instructionsFocusTimer.addEventListener(TimerEvent.TIMER, moveInstructionsFocus);
			instructionsFocusTimer.start();
		}
		
		public function handleClosePollingInstructionsWindow(e:PollingInstructionsWindowEvent):void{
			closeWindow(instructionsWindow);
		}
		
		// Checking the polling status to prevent a presenter from publishing two polls at a time
		  public function handleCheckStatusEvent(e:PollingStatusCheckEvent):void{
			  e.allowed = !service.getPollingStatus();
			  instructionsWindow.publishingAllowed = e.allowed;
		  }
		  
		  public function handleCheckTitlesInInstructions(e:PollGetTitlesEvent):void{
			  instructionsWindow.invalidTitles = e.titleList;
		  }
		  
		  public function handleReturnWebKeyEvent(e:GenerateWebKeyEvent):void
		  {
		  	  var transferURL:String = e.webHostIP + "/p/" + e.poll.webKey;
		  	  LogUtil.debug("Returning poll URL to Statistics window: " + transferURL);			  
			  statsWindow.webPollUrl = transferURL;

			  statsWindow.setUrlBoxText();

			  if (!e.repost){
				  instructionsWindow._webKey = e.poll.webKey;
			  } else{
				  statsWindow.trackingPoll.webKey = e.poll.webKey;
			  }
		  }

		// Action makers (function that actually act on the windows )
		//#############################################################################
		private function openWindow(window:IBbbModuleWindow):void{
			var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			windowEvent.window = window;
			if (windowEvent.window != null)
				globalDispatcher.dispatchEvent(windowEvent);
		}
		
		private function closeWindow(window:IBbbModuleWindow):void{
			var windowEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			windowEvent.window = window;
			globalDispatcher.dispatchEvent(windowEvent);
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
			service.setPolling(false);
		}
		//##########################################################################
		
		
		// PollingStatsWindow.mxml Window Handlers 
		//#########################################################################
		public function handleOpenPollingStatsWindow(e:PollingStatsWindowEvent):void{
			statsWindow = new PollingStatsWindow();
			statsWindow.trackingPoll = e.poll;
			openWindow(statsWindow);
			service.setPolling(true);
			
			statsFocusTimer.addEventListener(TimerEvent.TIMER, focusStatsWindow);
			statsFocusTimer.start();
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
