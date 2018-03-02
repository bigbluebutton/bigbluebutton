package org.bigbluebutton.air {
	
	import org.bigbluebutton.air.main.commands.ConnectingFinishedCommandAIR;
	import org.bigbluebutton.air.main.commands.DisconnectUserCommandAIR;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.UISession;
	import org.bigbluebutton.air.main.services.GuestWaitPageService;
	import org.bigbluebutton.lib.chat.models.ChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.ChatMessageService;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.common.models.SaveData;
	import org.bigbluebutton.lib.common.services.BaseConnection;
	import org.bigbluebutton.lib.common.services.IBaseConnection;
	import org.bigbluebutton.lib.main.commands.ChangeUserRoleCommand;
	import org.bigbluebutton.lib.main.commands.ChangeUserRoleSignal;
	import org.bigbluebutton.lib.main.commands.ConnectCommand;
	import org.bigbluebutton.lib.main.commands.ConnectSignal;
	import org.bigbluebutton.lib.main.commands.ConnectingFinishedSignal;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.commands.KickUserCommand;
	import org.bigbluebutton.lib.main.commands.KickUserSignal;
	import org.bigbluebutton.lib.main.commands.LockUserCommand;
	import org.bigbluebutton.lib.main.commands.LockUserSignal;
	import org.bigbluebutton.lib.main.commands.PresenterCommand;
	import org.bigbluebutton.lib.main.commands.PresenterSignal;
	import org.bigbluebutton.lib.main.models.ConferenceParameters;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IMeetingData;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.MeetingData;
	import org.bigbluebutton.lib.main.models.UserSession;
	import org.bigbluebutton.lib.main.services.BigBlueButtonConnection;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.main.services.IGuestWaitPageService;
	import org.bigbluebutton.lib.main.services.ILoginService;
	import org.bigbluebutton.lib.main.services.LoginService;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	import org.bigbluebutton.lib.presentation.services.PresentationService;
	import org.bigbluebutton.lib.screenshare.services.IScreenshareConnection;
	import org.bigbluebutton.lib.screenshare.services.ScreenshareConnection;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.user.services.UsersService;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.video.services.VideoConnection;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.voice.services.IVoiceService;
	import org.bigbluebutton.lib.voice.services.VoiceConnection;
	import org.bigbluebutton.lib.voice.services.VoiceService;
	
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class AppConfig implements IConfig {
		
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			// Singleton mapping
			injector.map(IUISession).toSingleton(UISession);
			injector.map(IUserSession).toSingleton(UserSession);
			injector.map(IMeetingData).toSingleton(MeetingData);
			injector.map(IConferenceParameters).toSingleton(ConferenceParameters);
			injector.map(IUsersService).toSingleton(UsersService);
			injector.map(IVoiceService).toSingleton(VoiceService);
			injector.map(IPresentationService).toSingleton(PresentationService);
			injector.map(IScreenshareConnection).toSingleton(ScreenshareConnection);
			injector.map(IChatMessageService).toSingleton(ChatMessageService);
			injector.map(IChatMessagesSession).toSingleton(ChatMessagesSession);
			injector.map(ISaveData).toSingleton(SaveData);
			// Type mapping
			injector.map(IBaseConnection).toType(BaseConnection);
			injector.map(IVoiceConnection).toType(VoiceConnection);
			injector.map(ILoginService).toType(LoginService);
			injector.map(IGuestWaitPageService).toType(GuestWaitPageService);
			injector.map(IBigBlueButtonConnection).toType(BigBlueButtonConnection);
			injector.map(IVideoConnection).toType(VideoConnection);
			
			// Signal to Command mapping
			signalCommandMap.map(ConnectSignal).toCommand(ConnectCommand);
			signalCommandMap.map(DisconnectUserSignal).toCommand(DisconnectUserCommandAIR);
			signalCommandMap.map(ConnectingFinishedSignal).toCommand(ConnectingFinishedCommandAIR);
			signalCommandMap.map(PresenterSignal).toCommand(PresenterCommand);
			signalCommandMap.map(LockUserSignal).toCommand(LockUserCommand);
			signalCommandMap.map(ChangeUserRoleSignal).toCommand(ChangeUserRoleCommand);
			signalCommandMap.map(KickUserSignal).toCommand(KickUserCommand);
			signalCommandMap.map(DisconnectUserSignal).toCommand(DisconnectUserCommandAIR);
		}
	}
}
