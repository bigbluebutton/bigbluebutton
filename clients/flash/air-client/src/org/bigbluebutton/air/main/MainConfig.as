package org.bigbluebutton.air.main {
	
	import org.bigbluebutton.air.main.commands.ConnectingFailedCommandAIR;
	import org.bigbluebutton.air.main.commands.JoinMeetingCommandAIR;
	import org.bigbluebutton.air.main.commands.NavigateToCommand;
	import org.bigbluebutton.air.main.commands.NavigateToSignal;
	import org.bigbluebutton.air.main.views.disconnectpage.DisconnectPageViewMediator;
	import org.bigbluebutton.air.main.views.disconnectpage.IDisconnectPageView;
	import org.bigbluebutton.air.main.views.exit.ExitPageViewMediator;
	import org.bigbluebutton.air.main.views.exit.IExitPageView;
	import org.bigbluebutton.air.main.views.guest.GuestPageViewMediator;
	import org.bigbluebutton.air.main.views.guest.IGuestPageView;
	import org.bigbluebutton.air.main.views.loginpage.ILoginPageView;
	import org.bigbluebutton.air.main.views.loginpage.LoginPageViewMediator;
	import org.bigbluebutton.air.main.views.menubuttons.IMenuButtonsView;
	import org.bigbluebutton.air.main.views.menubuttons.MenuButtonsViewMediator;
	import org.bigbluebutton.air.main.views.menubuttons.changestatus.ChangeStatusPopUpMediator;
	import org.bigbluebutton.air.main.views.menubuttons.changestatus.IChangeStatusPopUp;
	import org.bigbluebutton.air.main.views.pagesnavigator.IPagesNavigatorView;
	import org.bigbluebutton.air.main.views.pagesnavigator.PagesNavigatorViewMediator;
	import org.bigbluebutton.air.main.views.profile.IProfileView;
	import org.bigbluebutton.air.main.views.profile.ProfileViewMediator;
	import org.bigbluebutton.air.main.views.topbar.ITopBarView;
	import org.bigbluebutton.air.main.views.topbar.TopBarViewMediator;
	import org.bigbluebutton.air.main.views.ui.loadingscreen.ILoadingScreen;
	import org.bigbluebutton.air.main.views.ui.loadingscreen.LoadingScreenMediator;
	import org.bigbluebutton.air.main.views.ui.navigationbutton.INavigationButton;
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButtonMediator;
	import org.bigbluebutton.air.main.views.ui.recordingstatus.IRecordingStatus;
	import org.bigbluebutton.air.main.views.ui.recordingstatus.RecordingStatusMediator;
	import org.bigbluebutton.air.video.commands.ShareCameraCommand;
	import org.bigbluebutton.lib.main.commands.ConnectingFailedSignal;
	import org.bigbluebutton.lib.main.commands.EmojiCommand;
	import org.bigbluebutton.lib.main.commands.EmojiSignal;
	import org.bigbluebutton.lib.main.commands.JoinMeetingSignal;
	import org.bigbluebutton.lib.main.commands.RaiseHandCommand;
	import org.bigbluebutton.lib.main.commands.RaiseHandSignal;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneCommand;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	
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
			mediatorMap.map(IChangeStatusPopUp).toMediator(ChangeStatusPopUpMediator);
			mediatorMap.map(IExitPageView).toMediator(ExitPageViewMediator);
			mediatorMap.map(ITopBarView).toMediator(TopBarViewMediator);
			mediatorMap.map(IGuestPageView).toMediator(GuestPageViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
			signalCommandMap.map(JoinMeetingSignal).toCommand(JoinMeetingCommandAIR);
			signalCommandMap.map(ConnectingFailedSignal).toCommand(ConnectingFailedCommandAIR);
			signalCommandMap.map(RaiseHandSignal).toCommand(RaiseHandCommand);
			signalCommandMap.map(NavigateToSignal).toCommand(NavigateToCommand);
			signalCommandMap.map(EmojiSignal).toCommand(EmojiCommand);
			signalCommandMap.map(ShareCameraSignal).toCommand(ShareCameraCommand);
			signalCommandMap.map(ShareMicrophoneSignal).toCommand(ShareMicrophoneCommand);
		}
	}
}
