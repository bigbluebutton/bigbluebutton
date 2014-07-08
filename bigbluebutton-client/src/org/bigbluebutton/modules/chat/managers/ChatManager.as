package org.bigbluebutton.modules.chat.managers
{
	import com.asfusion.mate.events.Dispatcher;
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.AddUIComponentToMainCanvas;
	import org.bigbluebutton.modules.chat.views.ChatToolbar;
	import org.bigbluebutton.modules.chat.events.ChatToolbarButtonEvent;
	
	public class ChatManager {
        
		private var globalDispatcher:Dispatcher;
		private var highlighterToolbar:ChatToolbar = null;
		
		public function ChatManager():void {
			globalDispatcher = new Dispatcher();
			handleStartModuleEvent();
		}
		
		public function handleStartModuleEvent():void {	
			if (highlighterToolbar != null) return;
			highlighterToolbar = new ChatToolbar();
			/*
			highlighterToolbar.addEventListener(ChatToolbarButtonEvent.SAVE_CHAT_TOOLBAR_EVENT, saveEvent);
			highlighterToolbar.addEventListener(ChatToolbarButtonEvent.COPY_CHAT_TOOLBAR_EVENT, copyEvent);
			*/
		}	

		public function positionToolbar(e:ChatToolbarButtonEvent):void {
			var addUIEvent:AddUIComponentToMainCanvas = new AddUIComponentToMainCanvas(AddUIComponentToMainCanvas.ADD_COMPONENT);
			addUIEvent.component = highlighterToolbar;
			globalDispatcher.dispatchEvent(addUIEvent);
			highlighterToolbar.positionToolbar(e.window);
			highlighterToolbar.stage.focus = highlighterToolbar;
		}

		/*
		private function saveEvent():void{
			LogUtil.debug("saveEvent do manager");
			var evt:ChatToolbarButtonEvent = new ChatToolbarButtonEvent(ChatToolbarButtonEvent.SAVE_CHAT_TOOLBAR_EVENT); 
			globalDispatcher.dispatchEvent(evt);
		}

		private function copyEvent():void{
			LogUtil.debug("copyEvent do manager");
			var evt:ChatToolbarButtonEvent = new ChatToolbarButtonEvent(ChatToolbarButtonEvent.COPY_CHAT_TOOLBAR_EVENT);
			globalDispatcher.dispatchEvent(evt);
		}
		*/
	}
}
