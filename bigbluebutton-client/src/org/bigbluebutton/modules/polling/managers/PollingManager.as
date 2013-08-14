package org.bigbluebutton.modules.polling.managers
{
	import com.asfusion.mate.events.Dispatcher;
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.polling.views.PollingInstructionsWindow;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.common.events.CloseWindowEvent;

	import org.bigbluebutton.common.IBbbModuleWindow;

	import org.bigbluebutton.modules.polling.events.*;
	
	import org.bigbluebutton.modules.polling.service.PollingService;
	
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.model.users.Conference; 
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.main.events.ShortcutEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
			
	public class PollingManager
	{	
		
		public static const LOGNAME:String = "[PollingManager] ";	
		
		public var toolbarButtonManager:ToolbarButtonManager;
		private var module:PollingModule;
		private var globalDispatcher:Dispatcher;
		private var service:PollingService;
		private var viewWindowManager:PollingWindowManager;
		private var isPolling:Boolean = false;
		public var pollKey:String;
		public var participants:int;
		private var conference:Conference;
		private var synchTimer:Timer;
		
		
		public function PollingManager()
		{
				LogUtil.debug(LOGNAME +" Building PollingManager");
				service = new PollingService();
			    toolbarButtonManager = new ToolbarButtonManager();
			    globalDispatcher = new Dispatcher();
			    viewWindowManager = new PollingWindowManager(service);
		}
		
		
		//Starting Module
		public function handleStartModuleEvent(module:PollingModule):void {
			LogUtil.debug(LOGNAME + "Polling Module starting");
			this.module = module;			
			service.handleStartModuleEvent(module);
		}

	
        // Acting on Events when user SWITCH TO/FROM PRESENTER-VIEWER
        //#####################################################################################										
		public function handleMadePresenterEvent(e:MadePresenterEvent):void{
			LogUtil.debug(LOGNAME +" Adding Polling Menu");
			toolbarButtonManager.addToolbarButton();
		}
		
		public function handleMadeViewerEvent(e:MadePresenterEvent):void{
			toolbarButtonManager.removeToolbarButton();
		}
		//######################################################################################
		
		// Handling Window Events
		//#####################################################################################
		
	   //Sharing Polling Window
	   public function handleStartPollingEvent(e:StartPollingEvent):void{
			toolbarButtonManager.enableToolbarButton();
		}
        //##################################################################################
		
		// Closing Instructions Window
	   public function  handleClosePollingInstructionsWindowEvent(e:PollingInstructionsWindowEvent):void {
		   viewWindowManager.handleClosePollingInstructionsWindow(e);
		   toolbarButtonManager.enableToolbarButton();
		   toolbarButtonManager.focusToolbarButton();
	   }		
	   
		//Opening Instructions Window    
	  	public function handleOpenPollingInstructionsWindowEvent(e:PollingInstructionsWindowEvent):void {
			viewWindowManager.appFM = toolbarButtonManager.appFM;
		    viewWindowManager.handleOpenPollingInstructionsWindow(e);
		}
				
	  // Checking the polling status to prevent a presenter from publishing two polls at a time
	  public function handleCheckStatusEvent(e:PollingStatusCheckEvent):void{
		  viewWindowManager.handleCheckStatusEvent(e);
	  }
		//##################################################################################	
						
	  // Opening PollingViewWindow
	  public function handleOpenPollingViewWindow(e:PollingViewWindowEvent):void{
		   if(isPolling) return; 	
	       viewWindowManager.handleOpenPollingViewWindow(e);
	       toolbarButtonManager.disableToolbarButton();
		}  	
	  // Closing PollingViewWindow	
	  public function handleClosePollingViewWindow(e:PollingViewWindowEvent):void{
		      viewWindowManager.handleClosePollingViewWindow(e);
		      toolbarButtonManager.enableToolbarButton();
		}  	
		
	  // Stop polling, close all viewer's poll windows, and delete the web key if the poll in question has been published to the web	
	  public function handleStopPolling(e:StopPollEvent):void{
		  if (e.poll.publishToWeb){
			  service.cutOffWebPoll(e.poll);
		  }
		  viewWindowManager.handleStopPolling(e);
		  service.closeAllPollingWindows();
	  } 
	//##################################################################################
	   public function handleSavePollEvent(e:SavePollEvent):void
		{
			e.poll.room = module.getRoom();
			service.savePoll(e.poll);
		}	
		
	
		public function handlePublishPollEvent(e:PublishPollEvent):void
		{
			if (!service.getPollingStatus() && (e.poll.title != null)){
				e.poll.room = module.getRoom();
				service.publish(e.poll);
			}
		}	
		
		public function handleRepostPollEvent(e:PublishPollEvent):void
		{
			for (var v:int = 0; v < e.poll.votes.length; v++){
				e.poll.votes[v] = 0;
			}
			e.poll.totalVotes = 0;
			participants = 0;
			var p:BBBUser;
			conference = UserManager.getInstance().getConference();
			for (var i:int = 0; i < conference.users.length; i++) {
				p = conference.users.getItemAt(i) as BBBUser;
				if (p.role != Role.MODERATOR) {
					participants++;
				}
			} 
			e.poll.didNotVote = participants;
			e.poll.room = module.getRoom();
			service.publish(e.poll);
		}
		
		public function handleVoteEvent(e:VoteEvent):void
		{			   
			e.pollKey = module.getRoom() +"-"+ e.title;
			service.vote(e.pollKey, e.answerID);
		}
		
		public function handleGenerateWebKeyEvent(e:GenerateWebKeyEvent):void
		{
			e.poll.room = module.getRoom();
			e.pollKey = e.poll.room +"-"+ e.poll.title;
			service.generate(e);
		}
		
		public function handleReturnWebKeyEvent(e:GenerateWebKeyEvent):void
		{
			viewWindowManager.handleReturnWebKeyEvent(e);
		}
		//##################################################################################	
		
		  // Opening PollingStatsWindow
		  public function handleOpenPollingStatsWindow(e:PollingStatsWindowEvent):void{
			      e.poll.room = module.getRoom();
			      viewWindowManager.handleOpenPollingStatsWindow(e);
			}  	
		  // Closing PollingStatsWindow	
		  public function handleClosePollingStatsWindow(e:PollingStatsWindowEvent):void{
			      viewWindowManager.handleClosePollingStatsWindow(e);
			}
		  // Refreshing PollingStatsWindow	
		  public function handleRefreshPollingStatsWindow(e:PollRefreshEvent):void{
			      viewWindowManager.handleRefreshPollingStatsWindow(e);
		  }
		  
		  public function handleGetPollingStats(e:PollRefreshEvent):void{
		      e.poll.room = module.getRoom();
		      e.pollKey = e.poll.room +"-"+ e.poll.title ;
		      service.getPoll(e.pollKey, "refresh");
		  }  
		
		//##################################################################################

		  // Make a call to the service to update the list of titles and statuses for the Polling Menu
		  public function handleInitializePollMenuEvent(e:PollGetTitlesEvent):void{
			  if (module != null && module.getRoom() != null){
				  toolbarButtonManager.button.roomID = module.getRoom();
				  service.initializePollingMenu(module.getRoom());
			  }
		  }
		  
		  public function handleRemoteInitializePollMenuEvent(e:PollGetTitlesEvent):void{
			  if (module != null && module.getRoom() != null){
				  toolbarButtonManager.button.roomID = module.getRoom();
				  service.initializePollingMenuRemotely(module.getRoom());
			  }
		  }
		  
		  public function handleUpdateTitlesEvent(e:PollGetTitlesEvent):void{
			  toolbarButtonManager.button.roomID = module.getRoom();
			  service.updateTitles();
		  }

		  public function handleReturnTitlesEvent(e:PollReturnTitlesEvent):void{
			  toolbarButtonManager.button.titleList = e.titleList;
		  }
		  
		  public function handleRemoteReturnTitlesEvent(e:PollReturnTitlesEvent):void{
			  toolbarButtonManager.button.titleList = e.titleList;
			  // This timer gives the earlier NetConnection.call time to finish and deliver what it was sent out to get.
			  synchTimer = new Timer((1000*0.01));
			  synchTimer.addEventListener(TimerEvent.TIMER, remoteOpen);
			  synchTimer.start();
		  }
		  
		  private function remoteOpen(e:TimerEvent):void{
			  if (synchTimer != null){
				  synchTimer.removeEventListener(TimerEvent.TIMER, remoteOpen);
				  synchTimer = null;
				  toolbarButtonManager.button.remoteOpenPollingMenu();
			  }
		  }

		  public function handleGetPollEvent(e:PollGetPollEvent):void{
			  service.getPoll(e.pollKey, "menu");
		  }
		  
		  public function handlePopulateMenuEvent(e:PollGetPollEvent):void{
			  toolbarButtonManager.button.pollList.addItem(e.poll);
		  }
		  
		   public function handleReturnPollEvent(e:PollGetPollEvent):void{
			  var unique:Boolean = true;
			  if (toolbarButtonManager.button.pollList.length != null){
				  for (var i:int = 0; i < toolbarButtonManager.button.pollList.length; i++){
					  var listKey:String = toolbarButtonManager.button.pollList.getItemAt(i).room+"-"+toolbarButtonManager.button.pollList.getItemAt(i).title;
					  if (e.pollKey == listKey){
						  unique = false;
						  // Delete and replace the offending poll
						  toolbarButtonManager.button.pollList.setItemAt(e.poll, i);
					  } // _compare pollKeys
				  } // _for-loop
			  } // _if pollList is null
			  if (unique){
				  toolbarButtonManager.button.pollList.addItem(e.poll);
			  }
		  }
		
		  public function handleCheckTitlesEvent(e:PollGetTitlesEvent):void{
			  if (e.type == PollGetTitlesEvent.CHECK){
				  service.checkTitles();
			  }
			  else if (e.type == PollGetTitlesEvent.RETURN){
				  viewWindowManager.handleCheckTitlesInInstructions(e);
			  }
		  }
		//##################################################################################
		  
		  public function handleOpenSavedPollEvent(e:OpenSavedPollEvent):void{
		  	viewWindowManager.handleOpenPollingInstructionsWindowWithExistingPoll(e);
		  }
		  
		  public function handleReviewResultsEvent(e:ReviewResultsEvent):void{
			  viewWindowManager.handleReviewResultsEvent(e);
		  }
		//##################################################################################
		  public function handleGlobalPollHotkey(e:ShortcutEvent):void{
			  conference = UserManager.getInstance().getConference();
			  if (conference.amIPresenter){
				  toolbarButtonManager.openMenuRemotely();
			  }
		  }
   }
}
