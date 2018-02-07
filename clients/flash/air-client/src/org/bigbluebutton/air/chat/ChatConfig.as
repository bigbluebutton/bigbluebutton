package org.bigbluebutton.air.chat {
	
	import org.bigbluebutton.air.chat.views.ChatRoomsMediatorAIR;
	import org.bigbluebutton.air.chat.views.ChatViewMediatorAIR;
	import org.bigbluebutton.lib.chat.commands.RequestGroupChatHistoryCommand;
	import org.bigbluebutton.lib.chat.commands.RequestGroupChatHistorySignal;
	import org.bigbluebutton.lib.chat.commands.RequestWelcomeMessageCommand;
	import org.bigbluebutton.lib.chat.commands.RequestWelcomeMessageSignal;
	import org.bigbluebutton.lib.chat.commands.StartPrivateChatCommand;
	import org.bigbluebutton.lib.chat.commands.StartPrivateChatSignal;
	import org.bigbluebutton.lib.chat.views.ChatRoomsViewBase;
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	
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
			mediatorMap.map(ChatRoomsViewBase).toMediator(ChatRoomsMediatorAIR);
			mediatorMap.map(ChatViewBase).toMediator(ChatViewMediatorAIR);
		}
		
		private function signals():void {
			signalCommandMap.map(RequestGroupChatHistorySignal).toCommand(RequestGroupChatHistoryCommand);
			signalCommandMap.map(RequestWelcomeMessageSignal).toCommand(RequestWelcomeMessageCommand);
			signalCommandMap.map(StartPrivateChatSignal).toCommand(StartPrivateChatCommand);
		}
	}
}
