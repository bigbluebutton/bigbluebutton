package org.bigbluebutton.web.main {
	import org.bigbluebutton.lib.main.commands.AuthenticationSignal;
	import org.bigbluebutton.lib.main.commands.ConnectingFailedSignal;
	import org.bigbluebutton.lib.main.commands.ConnectingFinishedSignal;
	import org.bigbluebutton.lib.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.lib.main.views.MenuButtonsBase;
	import org.bigbluebutton.lib.main.views.MenuButtonsMediatorBase;
	import org.bigbluebutton.lib.main.views.TopToolbarBase;
	import org.bigbluebutton.web.main.commands.AuthenticationCommandWeb;
	import org.bigbluebutton.web.main.commands.ConnectingFailedCommandWeb;
	import org.bigbluebutton.web.main.commands.ConnectingFinishedCommandWeb;
	import org.bigbluebutton.web.main.commands.JoinMeetingCommandWeb;
	import org.bigbluebutton.web.main.models.IUISession;
	import org.bigbluebutton.web.main.models.UISession;
	import org.bigbluebutton.web.main.views.LoadingScreen;
	import org.bigbluebutton.web.main.views.LoadingScreenMediator;
	import org.bigbluebutton.web.main.views.MainShell;
	import org.bigbluebutton.web.main.views.MainShellMediator;
	import org.bigbluebutton.web.main.views.TopToolbarMediatorWeb;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class MainConfig implements IConfig {
		
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
			injector.map(IUISession).toSingleton(UISession);
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(LoadingScreen).toMediator(LoadingScreenMediator);
			mediatorMap.map(MainShell).toMediator(MainShellMediator);
			mediatorMap.map(MenuButtonsBase).toMediator(MenuButtonsMediatorBase);
			mediatorMap.map(TopToolbarBase).toMediator(TopToolbarMediatorWeb);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(JoinMeetingSignal).toCommand(JoinMeetingCommandWeb);
			signalCommandMap.map(AuthenticationSignal).toCommand(AuthenticationCommandWeb);
			signalCommandMap.map(ConnectingFinishedSignal).toCommand(ConnectingFinishedCommandWeb);
			signalCommandMap.map(ConnectingFailedSignal).toCommand(ConnectingFailedCommandWeb);
		}
	}
}
