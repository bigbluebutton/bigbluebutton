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
  import org.bigbluebutton.modules.chat.events.PrivateGroupChatCreatedEvent;
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
    
    private var MAIN_CHAT_WINID: String = "gcWin-0";
    
    public function ChatEventMapDelegate() {
      this.dispatcher = dispatcher;
      genWindowMappers();
      globalDispatcher = new Dispatcher();
    }
    
    private function genWindowMappers():void{
      getChatOptions();
      for (var i:int = 0; i < chatOptions.maxNumWindows; i++) {
        var winId: String = "gcWin-" + i;
        _windowMapper[winId] = new GroupChatWindowMapper(winId);
      }
    }
    
    private function findGroupChatWindowMapper(winId: String):GroupChatWindowMapper {
      if (_windowMapper.hasOwnProperty(winId)) {
        return _windowMapper[winId];
      }
      return null;
    }
    
    private function findUnusedWindowMapper():GroupChatWindowMapper {
      for (var winId:String in _windowMapper) {
        var wMapper: GroupChatWindowMapper = _windowMapper[winId];
        if (wMapper.isEmpty()) return wMapper;
      }
      return null;
    }
    
    private function openNewPublicGrouChatWindow(chatId: String, gc:GroupChat):void {
      var wMapper:GroupChatWindowMapper = findUnusedWindowMapper();
      if (wMapper != null) {
        // Setup a tracker for the state of this chat.
        var gcBoxMapper:GroubChatBoxMapper = new GroubChatBoxMapper(chatId);
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
    
    private function openChatBoxForPrivateChat(chatId: String, gc: GroupChat):void {
      // Setup a tracker for the state of this chat.
      var gcBoxMapper:GroubChatBoxMapper = new GroubChatBoxMapper(chatId);
      gcBoxMapper.chatBoxOpen = true;
      var winMapper:GroupChatWindowMapper = _windowMapper[MAIN_CHAT_WINID];
      winMapper.addChatBox(gcBoxMapper);
      
      globalDispatcher.dispatchEvent(new PrivateGroupChatCreatedEvent(chatId));
    }
    
    public function createNewGroupChat(chatId: String):void {
      if (ChatModel.MAIN_PUBLIC_CHAT == chatId){
        // Setup a tracker for the state of this chat.
        var gcBoxMapper:GroubChatBoxMapper = new GroubChatBoxMapper(chatId);
        gcBoxMapper.chatBoxOpen = true;
        var winMapper:GroupChatWindowMapper = _windowMapper[MAIN_CHAT_WINID];
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
          openNewPublicGrouChatWindow(chatId, gc);
        } else if (gc != null && gc.access == GroupChat.PRIVATE) {
          openChatBoxForPrivateChat(chatId, gc);
        }
      }
    }
    
    private function getChatOptions():void {
      chatOptions = Options.getOptions(ChatOptions) as ChatOptions;
    }
    
    public function handleReceivedGroupChatsEvent():void {	
      var gcIds:Array = LiveMeeting.inst().chats.getGroupChatIds();
      for (var i:int = 0; i < gcIds.length; i++) {
        var cid:String = gcIds[i];
        createNewGroupChat(cid);
      }
    }
    
    private function openChatWindow(window:ChatWindow):void {
      // Use the GLobal Dispatcher so that this message will be heard by the
      // main application.		   	
      var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
      event.window = window; 
      globalDispatcher.dispatchEvent(event);		
    }
    
    public function closeChatWindow():void {
      var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
      //	event.window = _chatWindow;
      globalDispatcher.dispatchEvent(event);
      
    }
  }
}