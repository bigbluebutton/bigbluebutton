package org.bigbluebutton.air {
	
	import org.bigbluebutton.air.chat.models.ChatMessagesSession;
	import org.bigbluebutton.air.chat.models.IChatMessagesSession;
	import org.bigbluebutton.air.chat.services.ChatMessageService;
	import org.bigbluebutton.air.chat.services.IChatMessageService;
	import org.bigbluebutton.air.common.models.ISaveData;
	import org.bigbluebutton.air.common.models.SaveData;
	import org.bigbluebutton.air.common.services.BaseConnection;
	import org.bigbluebutton.air.common.services.IBaseConnection;
	import org.bigbluebutton.air.deskshare.services.DeskshareConnection;
	import org.bigbluebutton.air.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.air.main.commands.ChangeUserRoleCommand;
	import org.bigbluebutton.air.main.commands.ChangeUserRoleSignal;
	import org.bigbluebutton.air.main.commands.ConnectCommand;
	import org.bigbluebutton.air.main.commands.ConnectSignal;
	import org.bigbluebutton.air.main.commands.ConnectingFinishedCommandAIR;
	import org.bigbluebutton.air.main.commands.ConnectingFinishedSignal;
	import org.bigbluebutton.air.main.commands.DisconnectUserCommandAIR;
	import org.bigbluebutton.air.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.air.main.commands.KickUserCommand;
	import org.bigbluebutton.air.main.commands.KickUserSignal;
	import org.bigbluebutton.air.main.commands.LockUserCommand;
	import org.bigbluebutton.air.main.commands.LockUserSignal;
	import org.bigbluebutton.air.main.commands.PresenterCommand;
	import org.bigbluebutton.air.main.commands.PresenterSignal;
	import org.bigbluebutton.air.main.models.ConferenceParameters;
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.main.models.IUserSession;
	import org.bigbluebutton.air.main.models.MeetingData;
	import org.bigbluebutton.air.main.models.UISession;
	import org.bigbluebutton.air.main.models.UserSession;
	import org.bigbluebutton.air.main.services.BigBlueButtonConnection;
	import org.bigbluebutton.air.main.services.GuestWaitPageService;
	import org.bigbluebutton.air.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.air.main.services.IGuestWaitPageService;
	import org.bigbluebutton.air.main.services.ILoginService;
	import org.bigbluebutton.air.main.services.LoginService;
	import org.bigbluebutton.air.presentation.services.IPresentationService;
	import org.bigbluebutton.air.presentation.services.PresentationService;
	import org.bigbluebutton.air.user.services.IUsersService;
	import org.bigbluebutton.air.user.services.UsersService;
	import org.bigbluebutton.air.video.services.IVideoConnection;
	import org.bigbluebutton.air.video.services.VideoConnection;
	import org.bigbluebutton.air.voice.services.IVoiceConnection;
	import org.bigbluebutton.air.voice.services.IVoiceService;
	import org.bigbluebutton.air.voice.services.VoiceConnection;
	import org.bigbluebutton.air.voice.services.VoiceService;
	
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
			injector.map(IDeskshareConnection).toSingleton(DeskshareConnection);
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
