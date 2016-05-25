package org.bigbluebutton.web.chat {
	import org.bigbluebutton.lib.chat.views.ChatRoomsViewBase;
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	import org.bigbluebutton.web.chat.views.ChatPanel;
	import org.bigbluebutton.web.chat.views.ChatPanelMediator;
	import org.bigbluebutton.web.chat.views.ChatRoomsMediatorWeb;
	import org.bigbluebutton.web.chat.views.ChatViewMediatorWeb;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class ChatConfig implements IConfig {
		
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			dependencies();
			mediators();
			signals();
		}
		
		/**
		 * Specifies all the dependencies for the feature
		 * that will be injected onto objects used by the
		 * application.
		 */
		private function dependencies():void {
			
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(ChatRoomsViewBase).toMediator(ChatRoomsMediatorWeb);
			mediatorMap.map(ChatViewBase).toMediator(ChatViewMediatorWeb);
			mediatorMap.map(ChatPanel).toMediator(ChatPanelMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			
		}
	}
}