package org.bigbluebutton.air.user {
	
	import org.bigbluebutton.air.main.commands.ClearUserStatusCommand;
	import org.bigbluebutton.air.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.air.main.commands.EmojiCommand;
	import org.bigbluebutton.air.main.commands.EmojiSignal;
	import org.bigbluebutton.air.user.views.UserDetailsView;
	import org.bigbluebutton.air.user.views.UserDetailsViewMediator;
	import org.bigbluebutton.air.user.views.UsersView;
	import org.bigbluebutton.air.user.views.UsersViewMediator;
	
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
			mediatorMap.map(UsersView).toMediator(UsersViewMediator);
			mediatorMap.map(UserDetailsView).toMediator(UserDetailsViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(EmojiSignal).toCommand(EmojiCommand);
			//signalCommandMap.map(MuteAllUsersSignal).toCommand(MuteAllUsersCommand);
			//signalCommandMap.map(MuteAllUsersExpectPresenterSignal).toCommand(MuteAllUsersExpectPresenterCommand);
			//signalCommandMap.map(SaveLockSettingsSignal).toCommand(SaveLockSettingsCommand);
			signalCommandMap.map(ClearUserStatusSignal).toCommand(ClearUserStatusCommand);
		}
	}
}
