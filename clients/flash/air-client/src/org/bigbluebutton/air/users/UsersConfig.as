package org.bigbluebutton.air.users {
	
	import org.bigbluebutton.air.users.views.participants.IParticipantsView;
	import org.bigbluebutton.air.users.views.participants.ParticipantsViewMediator;
	import org.bigbluebutton.air.users.views.userdetails.IUserDetailsView;
	import org.bigbluebutton.air.users.views.userdetails.UserDetailsViewMediator;
	import org.bigbluebutton.lib.main.commands.ClearUserStatusCommand;
	import org.bigbluebutton.lib.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.lib.main.commands.EmojiCommand;
	import org.bigbluebutton.lib.main.commands.EmojiSignal;
	import org.bigbluebutton.lib.main.commands.MuteAllUsersCommand;
	import org.bigbluebutton.lib.main.commands.MuteAllUsersExpectPresenterCommand;
	import org.bigbluebutton.lib.main.commands.MuteAllUsersExpectPresenterSignal;
	import org.bigbluebutton.lib.main.commands.MuteAllUsersSignal;
	import org.bigbluebutton.lib.main.commands.SaveLockSettingsCommand;
	import org.bigbluebutton.lib.main.commands.SaveLockSettingsSignal;
	
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
			mediatorMap.map(IParticipantsView).toMediator(ParticipantsViewMediator);
			mediatorMap.map(IUserDetailsView).toMediator(UserDetailsViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(EmojiSignal).toCommand(EmojiCommand);
			signalCommandMap.map(MuteAllUsersSignal).toCommand(MuteAllUsersCommand);
			signalCommandMap.map(MuteAllUsersExpectPresenterSignal).toCommand(MuteAllUsersExpectPresenterCommand);
			signalCommandMap.map(SaveLockSettingsSignal).toCommand(SaveLockSettingsCommand);
			signalCommandMap.map(ClearUserStatusSignal).toCommand(ClearUserStatusCommand);
		}
	}
}
