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
package org.bigbluebutton.modules.chat.maps {
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.events.CloseWindowEvent;
  import org.bigbluebutton.common.events.OpenWindowEvent;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.modules.chat.events.FocusOnChatBoxEvent;
  import org.bigbluebutton.modules.chat.events.GroupChatBoxClosedEvent;
  import org.bigbluebutton.modules.chat.events.NewGroupChatMessageEvent;
  import org.bigbluebutton.modules.chat.events.OpenChatBoxEvent;
  import org.bigbluebutton.modules.chat.events.PrivateGroupChatCreatedEvent;
  import org.bigbluebutton.modules.chat.events.PublicChatMessageEvent;
  import org.bigbluebutton.modules.chat.model.ChatModel;
  import org.bigbluebutton.modules.chat.model.ChatOptions;
  import org.bigbluebutton.modules.chat.model.GroupChat;
  import org.bigbluebutton.modules.chat.views.ChatWindow;
  import org.bigbluebutton.util.i18n.ResourceUtil;
  
  public class ChatEventMapDelegate {
    
    private var dispatcher:IEventDispatcher;
    
    private var _windows:Array = [];
    private var globalDispatcher:Dispatcher;
    
    private var chatOptions:ChatOptions;
    
    private var _windowMapper:Array = [];
    
    private var MAIN_CHAT_WINID: String = "ChatWindow0";
    
    public function ChatEventMapDelegate() {
      this.dispatcher = dispatcher;
      genWindowMappers();
      globalDispatcher = new Dispatcher();
    }
    
    private function genWindowMappers():void{
      getChatOptions();
      for (var i:int = 0; i < chatOptions.maxNumWindows; i++) {
        var winId: String = "ChatWindow" + i;
        _windowMapper[i] = new GroupChatWindowMapper(winId);
      }
    }
    
    private function findGroupChatWindowMapper(winId: String):GroupChatWindowMapper {
      for (var i:int=0; i<_windowMapper.length; i++) {
        var wMapper: GroupChatWindowMapper = _windowMapper[i];
        if (wMapper.gcWinId == winId) return wMapper;
      }
      return null;
    }
    
    private function findUnusedWindowMapper():GroupChatWindowMapper {
      // start looking for unused at 1 becuase 0 is reserved for the main chat
      for (var i:int=1; i<_windowMapper.length; i++) {
        var wMapper: GroupChatWindowMapper = _windowMapper[i];
        if (wMapper.isEmpty()) return wMapper;
      }
      return null;
    }
    
    private function openNewPublicGroupChatWindow(chatId: String, gc:GroupChat):void {
      var wMapper:GroupChatWindowMapper = findUnusedWindowMapper();
      if (wMapper != null) {
        // Setup a tracker for the state of this chat.
        var gcBoxMapper:GroupChatBoxMapper = new GroupChatBoxMapper(chatId);
        gcBoxMapper.chatBoxOpen = true;
        wMapper.addChatBox(gcBoxMapper);    
        
        var window:ChatWindow = new ChatWindow();
        window.setWindowId(wMapper.gcWinId);
        window.setMainChatId(chatId);
        window.chatOptions = chatOptions;
        window.title = gc.name;
        window.showCloseButton = true;
        window.setOpenAddTabBox(false);
        _windows[window.getWindowId()] = window;
        
        openChatWindow(window);
      }
    }
    
    private function findChatBoxMapper(chatId: String):GroupChatBoxMapper {
      for (var i:int=0; i<_windowMapper.length; i++) {
        var wMapper: GroupChatWindowMapper = _windowMapper[i];
        var gBoxMapper: GroupChatBoxMapper = wMapper.findChatBoxMapper(chatId);
        if (gBoxMapper != null) return gBoxMapper;
      }
      
      return null;
    }
    
    private function openChatBoxForPrivateChat(chatId: String, gc: GroupChat):void {
      // Setup a tracker for the state of this chat.
      var gcBoxMapper:GroupChatBoxMapper = new GroupChatBoxMapper(chatId);
      gcBoxMapper.chatBoxOpen = true;
      
      // By default we put all private chats on the main chat window. (ralam nov 5, 2017)
      var winMapper:GroupChatWindowMapper = findGroupChatWindowMapper(MAIN_CHAT_WINID);
      winMapper.addChatBox(gcBoxMapper);
      
      globalDispatcher.dispatchEvent(new PrivateGroupChatCreatedEvent(chatId));
    }
    
    public function createNewGroupChat(chatId: String):void {
      if (ChatModel.MAIN_PUBLIC_CHAT == chatId){
        // Setup a tracker for the state of this chat.
        var gcBoxMapper:GroupChatBoxMapper = new GroupChatBoxMapper(chatId);
        gcBoxMapper.chatBoxOpen = true;
        var winMapper:GroupChatWindowMapper = findGroupChatWindowMapper(MAIN_CHAT_WINID);
        winMapper.addChatBox(gcBoxMapper);
        
        var window:ChatWindow = new ChatWindow();
        window.setWindowId(winMapper.gcWinId);
        window.setMainChatId(chatId);
        window.chatOptions = chatOptions;
        window.title = ResourceUtil.getInstance().getString("bbb.chat.title");
        window.showCloseButton = false;
        window.setOpenAddTabBox(true);
        
        _windows[window.getWindowId()] = window;
        
        openChatWindow(window);
      } else {
        var gc:GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
        if (gc != null && gc.access == GroupChat.PUBLIC) {
          openNewPublicGroupChatWindow(chatId, gc);
        } else if (gc != null && gc.access == GroupChat.PRIVATE) {
          openChatBoxForPrivateChat(chatId, gc);
        }
      }
	}

	private function openOrCreateGroupChat(chatId: String):void {
		var gc:GroupChat = LiveMeeting.inst().chats.getGroupChat(chatId);
		if (gc != null) {
			var gboxMapper:GroupChatBoxMapper = findChatBoxMapper(chatId);
			if (gboxMapper != null) {
				if (gboxMapper.isChatBoxOpen()) {
					globalDispatcher.dispatchEvent(new FocusOnChatBoxEvent(chatId));
				} else if (gc.access == GroupChat.PRIVATE) {
					openChatBoxForPrivateChat(chatId, gc);
				}
			} else {
				createNewGroupChat(chatId);
			}
		}
	}
	
	public function handleOpenChatBoxEvent(event:OpenChatBoxEvent):void {
		openOrCreateGroupChat(event.chatId);
	}

    private function getChatOptions():void {
      chatOptions = Options.getOptions(ChatOptions) as ChatOptions;
    }
    
    public function handleReceivedGroupChatsEvent():void {	
      var gcIds:Array = LiveMeeting.inst().chats.getGroupChatIds();
      for (var i:int = 0; i < gcIds.length; i++) {
        var cid:String = gcIds[i];
        openOrCreateGroupChat(cid);
      }
    }
    
    public function handleNewGroupChatMessageEvent(event: NewGroupChatMessageEvent):void {
      var gc:GroupChat = LiveMeeting.inst().chats.getGroupChat(event.chatId);
      if (gc != null && gc.access == GroupChat.PRIVATE) {
        var gboxMapper: GroupChatBoxMapper = findChatBoxMapper(event.chatId);
        if (gboxMapper == null) {
          openChatBoxForPrivateChat(event.chatId, gc);
        }
      }
      
      var pcEvent:PublicChatMessageEvent = new PublicChatMessageEvent(event.chatId, event.msg);
      globalDispatcher.dispatchEvent(pcEvent);
    }
    
    public function chatBoxClosed(event: GroupChatBoxClosedEvent):void {
      var winMapper:GroupChatWindowMapper = findGroupChatWindowMapper(event.windowId);
      if (winMapper != null) {
        var chatBox: GroupChatBoxMapper = winMapper.findChatBoxMapper(event.chatId);
        if (chatBox != null) {
          winMapper.removeChatBox(event.chatId);
        } else {
        }
      }
    }
    
    private function openChatWindow(window:ChatWindow):void {
      // Use the Global Dispatcher so that this message will be heard by the
      // main application.		   	
      var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
      event.window = window; 
      globalDispatcher.dispatchEvent(event);		
    }
    
    public function closeChatWindows():void { //Never called
      for each (var window:ChatWindow in _windows) {
        var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
        event.window = window;
        globalDispatcher.dispatchEvent(event);
      }
    }
  }
}
