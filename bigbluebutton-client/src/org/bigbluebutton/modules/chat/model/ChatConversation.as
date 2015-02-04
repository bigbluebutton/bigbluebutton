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
package org.bigbluebutton.modules.chat.model
{
  import flash.system.Capabilities;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;

  public class ChatConversation
  { 
    [Bindable]
    public var messages:ArrayCollection = new ArrayCollection();
    
    public function numMessages():int {
      return messages.length;
    }
	
    public function newChatMessage(msg:ChatMessageVO):void {
      var cm:ChatMessage = new ChatMessage();
	  
      if (messages.length == 0) {
        cm.lastSenderId = "";
        cm.lastTime = cm.time;
      } else {
        cm.lastSenderId = getLastSender();
        cm.lastTime = getLastTime();
      }
      cm.senderId = msg.fromUserID;
      
      cm.text = msg.message;
      
      cm.name = msg.fromUsername;
      cm.senderColor = uint(msg.fromColor);
      
      cm.fromTime = msg.fromTime;		
      cm.fromTimezoneOffset = msg.fromTimezoneOffset;
      
      var sentTime:Date = new Date();
      sentTime.setTime(cm.fromTime);
      cm.time = ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
      
      messages.addItem(cm); 
    }
    
    public function getAllMessageAsString():String{
      var allText:String = "";
      var returnStr:String = (Capabilities.os.indexOf("Windows") >= 0 ? "\r\n" : "\r");
      for (var i:int = 0; i < messages.length; i++){
        var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
        allText += item.name + " - " + item.time + " : " + item.text + returnStr;
      }
      return allText;
    }
    
    private function getLastSender():String {
      var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
      return msg.senderId;
    }
    
    private function getLastTime():String {
      var msg:ChatMessage = messages.getItemAt(messages.length - 1) as ChatMessage;
      return msg.time;
    }
            
  }
}