package org.bigbluebutton.air.chat {
	
	import org.bigbluebutton.air.chat.views.ChatRoomsViewMediator;
	import org.bigbluebutton.air.chat.views.ChatViewMediator;
	import org.bigbluebutton.air.chat.views.IChatRoomsView;
	import org.bigbluebutton.air.chat.views.IChatView;
	import org.bigbluebutton.air.chat.views.SelectParticipantViewMediator;
	import org.bigbluebutton.air.users.views.ISelectParticipantView;
	
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
			mediatorMap.map(IChatView).toMediator(ChatViewMediator);
			mediatorMap.map(IChatRoomsView).toMediator(ChatRoomsViewMediator);
			mediatorMap.map(ISelectParticipantView).toMediator(SelectParticipantViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			
		}
	}
}
