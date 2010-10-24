package org.bigbluebutton.modules.chat.maps
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.IEventDispatcher;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.main.events.CloseWindowEvent;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.modules.chat.events.ChatOptionsEvent;
	import org.bigbluebutton.modules.chat.events.StartChatModuleEvent;
	import org.bigbluebutton.modules.chat.views.ChatWindow;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class ChatEventMapDelegate
	{
		private var dispatcher:IEventDispatcher;

		private var _chatWindow:ChatWindow;
		private var _chatWindowOpen:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		private var translationEnabled:Boolean;
		private var translationOn:Boolean;
				
		public function ChatEventMapDelegate()
		{
			this.dispatcher = dispatcher;
			_chatWindow = new ChatWindow();
			globalDispatcher = new Dispatcher();
		}

		public function openChatWindow():void {
		   	_chatWindow.title = ResourceUtil.getInstance().getString("bbb.chat.title");
		   	_chatWindow.showCloseButton = false;
		   	
		   	// Use the GLobal Dispatcher so that this message will be heard by the
		   	// main application.		   	
			var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			event.window = _chatWindow;
			trace("Dispatching OPEN CHAT WINDOW EVENT");
			globalDispatcher.dispatchEvent(event);
		   	
		   	_chatWindowOpen = true;
			
			dispatchTranslationOptions();

		}
		
		public function closeChatWindow():void {
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = _chatWindow;
			trace("Dispatching CLOSE CHAT WINDOW EVENT");
			globalDispatcher.dispatchEvent(event);
		   	
		   	_chatWindowOpen = false;
		}
		
		public function setTranslationOptions(e:StartChatModuleEvent):void{
			translationEnabled = e.translationEnabled;
			translationOn = e.translationOn;
		}
		
		private function dispatchTranslationOptions():void{
			var enableEvent:ChatOptionsEvent = new ChatOptionsEvent(ChatOptionsEvent.TRANSLATION_OPTION_ENABLED);
			enableEvent.translationEnabled = translationEnabled;
			enableEvent.translateOn = translationOn;
			globalDispatcher.dispatchEvent(enableEvent);
		}
	}
}