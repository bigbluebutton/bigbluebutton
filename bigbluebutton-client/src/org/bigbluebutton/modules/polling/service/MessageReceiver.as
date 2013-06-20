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
package org.bigbluebutton.modules.polling.service
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.polling.events.PollEvent;
  import org.bigbluebutton.modules.polling.model.Poll;
  import org.bigbluebutton.modules.polling.model.PollingModel;

  public class MessageReceiver implements IMessageListener
  {
    private static const LOG:String = "Poll::MessageReceiver - ";
    
    /* Injected by Mate */
    public var model:PollingModel;
    public var dispatcher:Dispatcher;
    
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      trace(LOG + "received message " + messageName);

      switch (messageName) {
        case "pollCreatedMessage":
          handlePollCreatedMesage(message);
          break;			
        case "pollUpdatedMessage":
          handlePollCreatedMesage(message);
          break;
        case "pollDestroyedMessage":
          handlePollCreatedMesage(message);
          break;
        case "pollStartedMessage":
          handlePollStartedMesage(message);
          break;
        case "pollStoppedMessage":
          handlePollStoppedMesage(message);
          break;
        case "pollResultUpdatedMessage":
          handlePollResultUpdatedMesage(message);
          break;
      }
    }

    private function handlePollResultUpdatedMesage(msg:Object):void {
      var pollResult:Object = JSON.parse(msg.mesage);
      
      if (! model.hasPoll(pollResult.id)) {
        
        model.updateResults(pollResult.id, msg.results);
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_RESULTS_UPDATED, msg.id));
      }
    }
    
    private function handlePollCreatedMesage(msg:Object):void {
      if (! model.hasPoll(msg.id)) {
        var id:String = msg.id;
        var title:String = msg.title;
        var poll:Poll = new Poll(msg.id, msg.title, msg.questions);
        model.createPoll(poll);
        
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_CREATED, poll.id));        
      }
    }
    
    private function handlePollUpdatedMesage(msg:Object):void {
      if (model.hasPoll(msg.id)) {
        var id:String = msg.id;
        var title:String = msg.title;
        var poll:Poll = new Poll(msg.id, msg.title, msg.questions);
        model.updatePoll(poll);
        
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_UPDATED, poll.id));        
      }
    }    

    private function handlePollDestroyedMesage(msg:Object):void {
      if (model.hasPoll(msg.id)) {
        model.destroyPoll(msg.id);
        
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_DESTROYED, msg.id));        
      }
    } 
    
    private function handlePollStartedMesage(msg:Object):void {
      if (model.hasPoll(msg.id)) {
        model.startPoll(msg.id);
        
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_STARTED, msg.id));        
      }
    }
    
    private function handlePollStoppedMesage(msg:Object):void {
      if (model.hasPoll(msg.id)) {
        model.stopPoll(msg.id);
        
        dispatcher.dispatchEvent(new PollEvent(PollEvent.POLL_STOPPED, msg.id));        
      }
    }
  }
}