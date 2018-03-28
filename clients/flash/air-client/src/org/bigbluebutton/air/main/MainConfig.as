package org.bigbluebutton.air.main {
	
	import org.bigbluebutton.air.main.commands.ConnectingFailedCommand;
	import org.bigbluebutton.air.main.commands.ConnectingFailedSignal;
	import org.bigbluebutton.air.main.commands.JoinMeetingCommand;
	import org.bigbluebutton.air.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.air.main.commands.NavigateToCommand;
	import org.bigbluebutton.air.main.commands.NavigateToSignal;
	import org.bigbluebutton.air.main.views.BannerView;
	import org.bigbluebutton.air.main.views.BannerViewMediator;
	import org.bigbluebutton.air.main.views.DisconnectView;
	import org.bigbluebutton.air.main.views.DisconnectViewMediator;
	import org.bigbluebutton.air.main.views.EmojiCallout;
	import org.bigbluebutton.air.main.views.EmojiCalloutMediator;
	import org.bigbluebutton.air.main.views.ExitView;
	import org.bigbluebutton.air.main.views.ExitViewMediator;
	import org.bigbluebutton.air.main.views.LoadingScreen;
	import org.bigbluebutton.air.main.views.LoadingScreenMediator;
	import org.bigbluebutton.air.main.views.MainView;
	import org.bigbluebutton.air.main.views.MainViewMediator;
	import org.bigbluebutton.air.main.views.MenuButtons;
	import org.bigbluebutton.air.main.views.MenuButtonsMediator;
	import org.bigbluebutton.air.main.views.PagesNavigatorView;
	import org.bigbluebutton.air.main.views.PagesNavigatorViewMediator;
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	import org.bigbluebutton.air.main.views.TopToolbarMediator;
	
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
			   mediatorMap.map(IProfileView).toMediator(ProfileViewMediator);
			 */
			mediatorMap.map(LoadingScreen).toMediator(LoadingScreenMediator);
			mediatorMap.map(PagesNavigatorView).toMediator(PagesNavigatorViewMediator);
			mediatorMap.map(BannerView).toMediator(BannerViewMediator);
			mediatorMap.mapMatcher(new TypeMatcher().allOf(TopToolbarBase)).toMediator(TopToolbarMediator);
			mediatorMap.map(MenuButtons).toMediator(MenuButtonsMediator);
			mediatorMap.map(EmojiCallout).toMediator(EmojiCalloutMediator);
			mediatorMap.map(ExitView).toMediator(ExitViewMediator);
			mediatorMap.map(DisconnectView).toMediator(DisconnectViewMediator);
			mediatorMap.map(MainView).toMediator(MainViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(JoinMeetingSignal).toCommand(JoinMeetingCommand);
			signalCommandMap.map(ConnectingFailedSignal).toCommand(ConnectingFailedCommand);
			signalCommandMap.map(NavigateToSignal).toCommand(NavigateToCommand);
		}
	}
}
