package org.bigbluebutton.air.chat {
	
	import org.bigbluebutton.air.chat.views.ChatRoomsMediatorAIR;
	import org.bigbluebutton.air.chat.views.ChatViewMediatorAIR;
	import org.bigbluebutton.air.chat.views.TopToolbarChat;
	import org.bigbluebutton.air.chat.views.TopToolbarMediatorChat;
	import org.bigbluebutton.lib.chat.views.ChatRoomsViewBase;
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	import org.bigbluebutton.lib.main.views.TopToolbarBase;
	
	import robotlegs.bender.extensions.matching.TypeMatcher;
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
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(ChatRoomsViewBase).toMediator(ChatRoomsMediatorAIR);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(TopToolbarBase, TopToolbarChat)).toMediator(TopToolbarMediatorChat);
			mediatorMap.map(ChatViewBase).toMediator(ChatViewMediatorAIR);
		}
	}
}
