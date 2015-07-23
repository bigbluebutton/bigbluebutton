package org.bigbluebutton.air.main {
	
	import org.bigbluebutton.air.main.commands.ConnectingFailedCommandAIR;
	import org.bigbluebutton.air.main.commands.JoinMeetingCommandAIR;
	import org.bigbluebutton.air.main.commands.NavigateToCommand;
	import org.bigbluebutton.air.main.commands.NavigateToSignal;
	import org.bigbluebutton.air.main.views.DisconnectPageViewMediator;
	import org.bigbluebutton.air.main.views.IDisconnectPageView;
	import org.bigbluebutton.air.main.views.ILoadingScreen;
	import org.bigbluebutton.air.main.views.ILoginPageView;
	import org.bigbluebutton.air.main.views.IMenuButtonsView;
	import org.bigbluebutton.air.main.views.INavigationButton;
	import org.bigbluebutton.air.main.views.IPagesNavigatorView;
	import org.bigbluebutton.air.main.views.IProfileView;
	import org.bigbluebutton.air.main.views.IRecordingStatus;
	import org.bigbluebutton.air.main.views.LoadingScreenMediator;
	import org.bigbluebutton.air.main.views.LoginPageViewMediator;
	import org.bigbluebutton.air.main.views.MenuButtonsViewMediator;
	import org.bigbluebutton.air.main.views.NavigationButtonMediator;
	import org.bigbluebutton.air.main.views.PagesNavigatorViewMediator;
	import org.bigbluebutton.air.main.views.ProfileViewMediator;
	import org.bigbluebutton.air.main.views.RecordingStatusMediator;
	import org.bigbluebutton.lib.main.commands.ConnectingFailedSignal;
	import org.bigbluebutton.lib.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.lib.main.commands.RaiseHandCommand;
	import org.bigbluebutton.lib.main.commands.RaiseHandSignal;
	
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
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(INavigationButton).toMediator(NavigationButtonMediator);
			mediatorMap.map(IRecordingStatus).toMediator(RecordingStatusMediator);
			mediatorMap.map(IPagesNavigatorView).toMediator(PagesNavigatorViewMediator);
			mediatorMap.map(IMenuButtonsView).toMediator(MenuButtonsViewMediator);
			mediatorMap.map(ILoginPageView).toMediator(LoginPageViewMediator);
			mediatorMap.map(ILoadingScreen).toMediator(LoadingScreenMediator);
			mediatorMap.map(IDisconnectPageView).toMediator(DisconnectPageViewMediator);
			mediatorMap.map(IProfileView).toMediator(ProfileViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(JoinMeetingSignal).toCommand(JoinMeetingCommandAIR);
			signalCommandMap.map(ConnectingFailedSignal).toCommand(ConnectingFailedCommandAIR);
			signalCommandMap.map(RaiseHandSignal).toCommand(RaiseHandCommand);
			signalCommandMap.map(NavigateToSignal).toCommand(NavigateToCommand);
		}
	}
}