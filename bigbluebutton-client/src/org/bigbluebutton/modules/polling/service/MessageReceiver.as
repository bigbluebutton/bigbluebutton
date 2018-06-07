/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.main.model.users.IMessageListener;

  public class MessageReceiver implements IMessageListener
  {
    private static const LOGGER:ILogger = getClassLogger(MessageReceiver);
    
    private var processor:PollDataProcessor;
    
    public function MessageReceiver(processor:PollDataProcessor) {
      LOGGER.debug("registering message listener");
      this.processor = processor;
      BBB.initConnectionManager().addMessageListener(this);
    }

    public function onMessage(messageName:String, message:Object):void {
      // LOGGER.debug("received message {0}", [messageName]);

      switch (messageName) {
        case "PollShowResultEvtMsg":
          processor.handlePollShowResultMessage(message, true);
          break;
        case "PollHideResultEvtMsg":
          processor.handlePollShowResultMessage(message, false);
          break;
        case "PollStartedEvtMsg":
          processor.handlePollStartedMesage(message);
          break;
        case "PollStoppedEvtMsg":
          processor.handlePollStoppedMesage(message);
          break;
        case "PollUpdatedEvtMsg":
          processor.handlePollUpdatedMessage(message);
          break;
        case "UserRespondedToPollRespMsg":
          processor.handleUserRespondedToPollRespMsg(message);
          break;
      }
    }
  }
}