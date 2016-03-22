package org.bigbluebutton.air.users.views.userdetails {
	
	import org.bigbluebutton.lib.main.commands.ClearUserStatusCommand;
	import org.bigbluebutton.lib.main.commands.ClearUserStatusSignal;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class UserDetailsConfig implements IConfig {
		
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
			mediatorMap.map(IUserDetailsView).toMediator(UserDetailsViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(ClearUserStatusSignal).toCommand(ClearUserStatusCommand);
			//signalCommandMap.map(ButtonTestSignal).toCommand(ButtonTestCommand);
		}
	}
}
