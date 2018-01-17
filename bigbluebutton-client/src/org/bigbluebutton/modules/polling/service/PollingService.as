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
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.modules.polling.events.ShowPollResultEvent;
	import org.bigbluebutton.modules.polling.events.StartCustomPollEvent;
	import org.bigbluebutton.modules.polling.events.StartPollEvent;
	import org.bigbluebutton.modules.polling.events.StopPollEvent;
	import org.bigbluebutton.modules.polling.events.VotePollEvent;
	import org.bigbluebutton.modules.polling.model.PollingModel;
	import org.bigbluebutton.modules.polling.model.SimplePoll;
	import org.bigbluebutton.modules.present.model.Presentation;
	import org.bigbluebutton.modules.present.model.PresentationModel;

	public class PollingService
	{	
		private static const LOGGER:ILogger = getClassLogger(PollingService);      

	    private var dataService:IPollDataService;
    	private var model:PollingModel;
    	private var sender:MessageSender;
		private var dataProcessor:PollDataProcessor;
		private var receiver:MessageReceiver;
		
		public function PollingService() {
			model = new PollingModel();
			sender = new MessageSender();
			dataService = new NetworkPollDataService(sender);
			dataProcessor = new PollDataProcessor(model);
			receiver = new MessageReceiver(dataProcessor);
		}
			
		public function handleStartModuleEvent(module:PollingModule):void {
       		LOGGER.debug("module started event");
		}
			

    private function generatePollId():String {
      var curPres:Presentation = PresentationModel.getInstance().getCurrentPresentation();
      if (curPres != null) {
        var date:Date = new Date();

        var pollId:String;
        pollId = curPres.id + "/" + curPres.getCurrentPage().num + "/" + date.time;

        return pollId;
      }
      
      return null;
    }

    public function handleStartCustomPollEvent(event:StartCustomPollEvent):void {
      var pollId:String = generatePollId();
      if (pollId == null) return;
      dataService.startCustomPoll(pollId, event.pollType, event.answers);
    }

    public function handleStartPollEvent(event:StartPollEvent):void {
      var pollId:String = generatePollId();
      if (pollId == null) return;
      dataService.startPoll(pollId, event.pollType);
    }
    
    public function handleStopPollEvent(event:StopPollEvent):void {
      var curPoll:SimplePoll = model.getCurrentPoll();
      dataService.stopPoll(curPoll.id);
    }
    
    public function handleVotePollEvent(event:VotePollEvent):void {
      var curPoll:SimplePoll = model.getCurrentPoll();
      dataService.votePoll(curPoll.id, event.answerId);
    }
    
    public function handleShowPollResultEvent(event:ShowPollResultEvent):void {
      var curPoll:SimplePoll = model.getCurrentPoll();
      dataService.showPollResult(curPoll.id);
    }
    

	}
}