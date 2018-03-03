package org.bigbluebutton.air.main {
	
	import org.bigbluebutton.air.main.commands.ConnectingFailedCommandAIR;
	import org.bigbluebutton.air.main.commands.ConnectingFailedSignal;
	import org.bigbluebutton.air.main.commands.JoinMeetingCommandAIR;
	import org.bigbluebutton.air.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.air.main.commands.NavigateToCommand;
	import org.bigbluebutton.air.main.commands.NavigateToSignal;
	import org.bigbluebutton.air.main.views.BannerView;
	import org.bigbluebutton.air.main.views.BannerViewMediator;
	import org.bigbluebutton.air.main.views.DisconnectView;
	import org.bigbluebutton.air.main.views.DisconnectViewMediator;
	import org.bigbluebutton.air.main.views.ExitView;
	import org.bigbluebutton.air.main.views.ExitViewMediator;
	import org.bigbluebutton.air.main.views.LoadingScreen;
	import org.bigbluebutton.air.main.views.LoadingScreenMediator;
	import org.bigbluebutton.air.main.views.MenuButtonsBase;
	import org.bigbluebutton.air.main.views.MenuButtonsMediatorAIR;
	import org.bigbluebutton.air.main.views.PagesNavigatorView;
	import org.bigbluebutton.air.main.views.PagesNavigatorViewMediator;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	import org.bigbluebutton.air.main.views.TopToolbarMediatorAIR;
	
	import robotlegs.bender.extensions.matching.TypeMatcher;
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class MainConfig implements IConfig {
		
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
			/*
				 mediatorMap.map(INavigationButton).toMediator(NavigationButtonMediator);
				 mediatorMap.map(IRecordingStatus).toMediator(RecordingStatusMediator);
				 mediatorMap.map(IPagesNavigatorView).toMediator(PagesNavigatorViewMediator);
				 mediatorMap.map(IMenuButtonsView).toMediator(MenuButtonsViewMediator);
				 mediatorMap.map(ILoginPageView).toMediator(LoginPageViewMediator);
				 mediatorMap.map(ILoadingScreen).toMediator(LoadingScreenMediator);
				 mediatorMap.map(IDisconnectPageView).toMediator(DisconnectPageViewMediator);
				 mediatorMap.map(IProfileView).toMediator(ProfileViewMediator);
				 mediatorMap.map(IChangeStatusPopUp).toMediator(ChangeStatusPopUpMediator);
				 mediatorMap.map(IExitPageView).toMediator(ExitPageViewMediator);
			 */
			mediatorMap.map(LoadingScreen).toMediator(LoadingScreenMediator);
			mediatorMap.map(PagesNavigatorView).toMediator(PagesNavigatorViewMediator);
			mediatorMap.map(BannerView).toMediator(BannerViewMediator);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(TopToolbarBase, TopToolbarAIR)).toMediator(TopToolbarMediatorAIR);
			mediatorMap.map(MenuButtonsBase).toMediator(MenuButtonsMediatorAIR);
			mediatorMap.map(ExitView).toMediator(ExitViewMediator);
			mediatorMap.map(DisconnectView).toMediator(DisconnectViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(JoinMeetingSignal).toCommand(JoinMeetingCommandAIR);
			signalCommandMap.map(ConnectingFailedSignal).toCommand(ConnectingFailedCommandAIR);
			signalCommandMap.map(NavigateToSignal).toCommand(NavigateToCommand);
		}
	}
}
