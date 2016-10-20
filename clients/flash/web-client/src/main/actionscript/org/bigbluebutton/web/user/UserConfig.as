package org.bigbluebutton.web.user {
	import org.bigbluebutton.lib.main.commands.ClearUserStatusCommand;
	import org.bigbluebutton.lib.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.lib.main.commands.KickUserCommand;
	import org.bigbluebutton.lib.main.commands.KickUserSignal;
	import org.bigbluebutton.lib.main.commands.LockUserCommand;
	import org.bigbluebutton.lib.main.commands.LockUserSignal;
	import org.bigbluebutton.lib.main.commands.PresenterCommand;
	import org.bigbluebutton.lib.main.commands.PresenterSignal;
	import org.bigbluebutton.lib.user.views.UsersViewBase;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteCommand;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteSignal;
	import org.bigbluebutton.web.user.views.UserViewMediatorWeb;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class UserConfig implements IConfig {
		
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
			mediatorMap.map(UsersViewBase).toMediator(UserViewMediatorWeb);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(ClearUserStatusSignal).toCommand(ClearUserStatusCommand);
			signalCommandMap.map(PresenterSignal).toCommand(PresenterCommand);
			signalCommandMap.map(LockUserSignal).toCommand(LockUserCommand);
			signalCommandMap.map(MicrophoneMuteSignal).toCommand(MicrophoneMuteCommand);
			signalCommandMap.map(KickUserSignal).toCommand(KickUserCommand);
		}
	}
}
