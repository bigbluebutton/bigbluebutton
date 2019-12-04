package org.bigbluebutton.air.chat {
	
	import org.bigbluebutton.air.chat.commands.RequestGroupChatHistoryCommand;
	import org.bigbluebutton.air.chat.commands.RequestGroupChatHistorySignal;
	import org.bigbluebutton.air.chat.commands.RequestWelcomeMessageCommand;
	import org.bigbluebutton.air.chat.commands.RequestWelcomeMessageSignal;
	import org.bigbluebutton.air.chat.commands.StartPrivateChatCommand;
	import org.bigbluebutton.air.chat.commands.StartPrivateChatSignal;
	import org.bigbluebutton.air.chat.views.ChatViewBase;
	import org.bigbluebutton.air.chat.views.ChatViewMediator;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class ChatConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			mediators();
			signals();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(ChatViewBase).toMediator(ChatViewMediator);
		}
		
		private function signals():void {
			signalCommandMap.map(RequestGroupChatHistorySignal).toCommand(RequestGroupChatHistoryCommand);
			signalCommandMap.map(RequestWelcomeMessageSignal).toCommand(RequestWelcomeMessageCommand);
			signalCommandMap.map(StartPrivateChatSignal).toCommand(StartPrivateChatCommand);
		}
	}
}
