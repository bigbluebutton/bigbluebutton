package org.bigbluebutton.air.users {
	
	import org.bigbluebutton.air.users.views.UsersViewMediatorAIR;
	import org.bigbluebutton.lib.user.views.UsersViewBase;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class UsersConfig implements IConfig {
		
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
			mediatorMap.map(UsersViewBase).toMediator(UsersViewMediatorAIR);
			//mediatorMap.map(IUserDetailsView).toMediator(UserDetailsViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			/*
			signalCommandMap.map(EmojiSignal).toCommand(EmojiCommand);
			signalCommandMap.map(MuteAllUsersSignal).toCommand(MuteAllUsersCommand);
			signalCommandMap.map(MuteAllUsersExpectPresenterSignal).toCommand(MuteAllUsersExpectPresenterCommand);
			signalCommandMap.map(SaveLockSettingsSignal).toCommand(SaveLockSettingsCommand);
			signalCommandMap.map(ClearUserStatusSignal).toCommand(ClearUserStatusCommand);
			*/
		}
	}
}
