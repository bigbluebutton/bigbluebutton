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
package org.bigbluebutton.modules.polling.service
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.modules.polling.events.CreatePollEvent;
	import org.bigbluebutton.modules.polling.events.GenerateWebKeyEvent;
	import org.bigbluebutton.modules.polling.events.PollEvent;
	import org.bigbluebutton.modules.polling.events.PollGetPollEvent;
	import org.bigbluebutton.modules.polling.events.PollGetTitlesEvent;
	import org.bigbluebutton.modules.polling.events.PollRefreshEvent;
	import org.bigbluebutton.modules.polling.events.PollReturnTitlesEvent;
	import org.bigbluebutton.modules.polling.events.PollingStatsWindowEvent;
	import org.bigbluebutton.modules.polling.events.PollingViewWindowEvent;
	import org.bigbluebutton.modules.polling.events.UpdatePollEvent;
	import org.bigbluebutton.modules.polling.managers.PollingWindowManager;
	import org.bigbluebutton.modules.polling.model.PollObject;
	import org.bigbluebutton.modules.polling.views.PollingInstructionsWindow;
	import org.bigbluebutton.modules.polling.views.PollingViewWindow;

	public class PollingService
	{	
		private static const LOG:String = "PollingService - ";

    public var receiver:MessageReceiver;
    public var sender:MessageSender;
		
		public function handleStartModuleEvent(module:PollingModule):void {

		}
		

		public function handleCreatePollEvent(event:CreatePollEvent):void {
      sender.createPoll(event.poll);
		}
		
    public function handleUpdatePollEvent(event:UpdatePollEvent):void {
      sender.updatePoll(event.poll);
    }

    public function handleStartPollEvent(event:PollEvent):void {
      sender.startPoll(event.pollID);
    }
    
    public function handleStopPollEvent(event:PollEvent):void {
      sender.stopPoll(event.pollID);
    }
    
    public function handleRemovePollEvent(event:PollEvent):void {
      sender.removePoll(event.pollID);
    }
    
	  public function  getPoll(pollKey:String, option:String):void{	

	   	}  
	  
		public function publish(poll:PollObject):void{

		}
		 
		public function vote(pollKey:String, answerIDs:Array, webVote:Boolean = false):void{

		}
			
		public function cutOffWebPoll(poll:PollObject):void{

		}
	  	

		
		public function initializePollingMenu(roomID:String):void{
 		
		 }
		
		public function initializePollingMenuRemotely(roomID:String):void{
/*      
			nc.call("poll.titleList", new Responder(titleSuccess, titleFailure));
			//--------------------------------------//
			// Responder functions
			function titleSuccess(obj:Object):void{
				LogUtil.debug("REMOTE_POLL_MENU_INIT: Entering NC CALL SUCCESS section");
				var event:PollReturnTitlesEvent = new PollReturnTitlesEvent(PollReturnTitlesEvent.REMOTE_RETURN);
				event.titleList = obj as Array;
				// Append roomID to each item in titleList, call getPoll on that key, add the result to pollList back in ToolBarButton
				for (var i:int = 0; i < event.titleList.length; i++){
					var pollKey:String = roomID +"-"+ event.titleList[i];
					getPoll(pollKey, "initialize");
				}
				// This dispatch populates the titleList back in the Menu; the pollList is populated one item at a time in the for-loop
				LogUtil.debug("PollingService.initializePollingMenuRemotely, dispatching PollReturnTitlesEvent.REMOTE_RETURN");
				dispatcher.dispatchEvent(event);
			}
			function titleFailure(obj:Object):void{
				LogUtil.error(LOGNAME+"Responder object failure in INITALIZE POLLING MENU NC.CALL");
				LogUtil.error("Failure object tostring is: " + obj.toString());
			}
*/
		}
		 
		 public function updateTitles():void{

		 }
		 
		 
		 public function checkTitles():void{

		 }
		 
		 public function openPoll(pollKey:String):void{

		 }
		 
		 public function closePoll(pollKey:String):void{

		 }
		 
		 public function generate(generateEvent:GenerateWebKeyEvent):void{

		}
	}
}