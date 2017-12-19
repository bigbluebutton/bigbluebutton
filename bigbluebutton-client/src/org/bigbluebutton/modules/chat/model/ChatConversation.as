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
  import com.adobe.utils.StringUtil;
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.system.Capabilities;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.chat.ChatUtil;
  import org.bigbluebutton.modules.chat.vo.ChatMessageVO;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class ChatConversation
  { 
    private var _dispatcher:Dispatcher = new Dispatcher();
    
    [Bindable]
    public var messages:ArrayCollection = new ArrayCollection();
    
    private var id: String;
    
		private var welcomeMsgAdded:Boolean = false;
		private var modOnlyMsgAdded:Boolean = false;
		private var howToCloseMsgAdded:Boolean = false;
		
    public function ChatConversation(id: String) {
      this.id = id;
    }
    
    public function getId(): String {
      return id;
    }
    
    public function numMessages():int {
      return messages.length;
    }
    
    public function newChatMessage(msg:ChatMessageVO):void {
			// Let's filter messages that we don't want duplicated especially
			// on auto-reconnects (ralam dec 19, 2017)
			if (msg.fromUserId == ChatModel.WELCOME_MSG) {
				if (welcomeMsgAdded) {
					return;
				} else {
					welcomeMsgAdded = true;
				}
			}
			
			if (msg.fromUserId == ChatModel.MOD_ONLY_MSG) {
				if (modOnlyMsgAdded) {
					return;
				} else {
					modOnlyMsgAdded = true;
				}
			}
			
			if (msg.fromUserId == ChatModel.HOW_TO_CLOSE_MSG) {
				if (howToCloseMsgAdded) {
					return;
				} else {
					howToCloseMsgAdded = true;
				}
			}
			
      var newCM:ChatMessage = convertChatMessage(msg);
      if (messages.length > 0) {
        var previousCM:ChatMessage = messages.getItemAt(messages.length-1) as ChatMessage;
        newCM.lastSenderId = previousCM.senderId;
        newCM.lastTime = previousCM.time;
      }
      messages.addItem(newCM);
    }
    
    public function newPrivateChatMessage(msg:ChatMessageVO):void {
      var newCM:ChatMessage = convertChatMessage(msg);
      if (messages.length > 0) {
        var previousCM:ChatMessage = messages.getItemAt(messages.length-1) as ChatMessage;
        newCM.lastSenderId = previousCM.senderId;
        newCM.lastTime = previousCM.time;
      }
      messages.addItem(newCM);
    }
    
		public function resetFlags():void {
			welcomeMsgAdded = false;
			modOnlyMsgAdded = false;
			howToCloseMsgAdded = false;
		}
		
    public function processChatHistory(messageVOs:Array):void {
      if (messageVOs.length > 0) {
				// Need to re-initialize our message collection as client might have
				// auto-reconnected (ralam dec 19, 2017)
        messages = new ArrayCollection();
				resetFlags();
        var previousCM:ChatMessage = convertChatMessage(messageVOs[0] as ChatMessageVO);;
        var newCM:ChatMessage;
        messages.addItemAt(previousCM, 0);
        
        for (var i:int=1; i < messageVOs.length; i++) {
          newCM = convertChatMessage(messageVOs[i] as ChatMessageVO);
          newCM.lastSenderId = previousCM.senderId;
          newCM.lastTime = previousCM.time;
          messages.addItemAt(newCM, i);
          previousCM = newCM;
        }
        
        if (messageVOs.length < messages.length) {
          newCM = messages.getItemAt(messageVOs.length) as ChatMessage;
          newCM.lastSenderId = previousCM.senderId;
          newCM.lastTime = previousCM.time;
        }
      }
    }
    
    private function convertChatMessage(msgVO:ChatMessageVO):ChatMessage {
      var cm:ChatMessage = new ChatMessage();
      
      cm.lastSenderId = "";
      cm.lastTime = "";
      
      cm.senderId = msgVO.fromUserId;
      
      cm.text = msgVO.message;
      
      cm.name = msgVO.fromUsername;
      cm.senderColor = uint(msgVO.fromColor);
      
      // Welcome message will skip time
      if (msgVO.fromTime != -1) {
        cm.fromTime = msgVO.fromTime;
        cm.fromTimezoneOffset = msgVO.fromTimezoneOffset;
        cm.time = convertTimeNumberToString(msgVO.fromTime);
      }
      return cm
    }
    
    private function convertTimeNumberToString(time:Number):String {
      var sentTime:Date = new Date();
      sentTime.setTime(time);
      return ChatUtil.getHours(sentTime) + ":" + ChatUtil.getMinutes(sentTime);
    }
    
    public function getAllMessageAsString():String{
      var allText:String = "";
      var returnStr:String = (Capabilities.os.indexOf("Windows") >= 0 ? "\r\n" : "\n");
      for (var i:int = 0; i < messages.length; i++){
        var item:ChatMessage = messages.getItemAt(i) as ChatMessage;
        if (StringUtil.trim(item.name) != "") {
          allText += item.name + "\t";
        }
        allText += item.time + "\t";
        allText += item.text + returnStr;
      }
      return allText;
    }
    
    public function clearPublicChat():void {
      var cm:ChatMessage = new ChatMessage();
      cm.time = convertTimeNumberToString(new Date().time);
      cm.text = "<b><i>"+ResourceUtil.getInstance().getString('bbb.chat.clearBtn.chatMessage')+"</i></b>";
      cm.name = "";
      cm.senderColor = uint(0x000000);
      
      messages.removeAll();
      messages.addItem(cm);
    }
  }
}