package org.bigbluebutton.web.chat {
	import org.bigbluebutton.lib.chat.models.ChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.ChatMessageService;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.web.chat.views.ChatView;
	import org.bigbluebutton.web.chat.views.ChatViewMediator;
	import org.bigbluebutton.web.chat.views.ChatWindow;
	import org.bigbluebutton.web.chat.views.ChatWindowMediator;
	
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
			injector.map(IChatMessageService).toSingleton(ChatMessageService);
			injector.map(IChatMessagesSession).toSingleton(ChatMessagesSession);
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(ChatWindow).toMediator(ChatWindowMediator);
			mediatorMap.map(ChatView).toMediator(ChatViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			
		}
	}
}