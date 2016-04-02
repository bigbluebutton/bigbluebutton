package org.bigbluebutton.air {
	
	import org.bigbluebutton.air.main.commands.AuthenticationCommandAIR;
	import org.bigbluebutton.air.main.commands.ConnectingFinishedCommandAIR;
	import org.bigbluebutton.air.main.commands.DisconnectUserCommandAIR;
	import org.bigbluebutton.air.main.models.IUserUISession;
	import org.bigbluebutton.air.main.models.UserUISession;
	import org.bigbluebutton.air.video.commands.ShareCameraCommand;
	import org.bigbluebutton.lib.chat.models.ChatMessagesSession;
	import org.bigbluebutton.lib.chat.models.IChatMessagesSession;
	import org.bigbluebutton.lib.chat.services.ChatMessageService;
	import org.bigbluebutton.lib.chat.services.IChatMessageService;
	import org.bigbluebutton.lib.common.models.ISaveData;
	import org.bigbluebutton.lib.common.models.SaveData;
	import org.bigbluebutton.lib.common.services.BaseConnection;
	import org.bigbluebutton.lib.common.services.IBaseConnection;
	import org.bigbluebutton.lib.deskshare.services.DeskshareConnection;
	import org.bigbluebutton.lib.deskshare.services.IDeskshareConnection;
	import org.bigbluebutton.lib.main.commands.AuthenticationSignal;
	import org.bigbluebutton.lib.main.commands.ConnectCommand;
	import org.bigbluebutton.lib.main.commands.ConnectSignal;
	import org.bigbluebutton.lib.main.commands.ConnectingFinishedSignal;
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.models.ConferenceParameters;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.UserSession;
	import org.bigbluebutton.lib.main.services.BigBlueButtonConnection;
	import org.bigbluebutton.lib.main.services.IBigBlueButtonConnection;
	import org.bigbluebutton.lib.main.services.ILoginService;
	import org.bigbluebutton.lib.main.services.LoginService;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideCommand;
	import org.bigbluebutton.lib.presentation.commands.LoadSlideSignal;
	import org.bigbluebutton.lib.presentation.services.IPresentationService;
	import org.bigbluebutton.lib.presentation.services.PresentationService;
	import org.bigbluebutton.lib.user.services.IUsersService;
	import org.bigbluebutton.lib.user.services.UsersService;
	import org.bigbluebutton.lib.video.commands.CameraQualityCommand;
	import org.bigbluebutton.lib.video.commands.CameraQualitySignal;
	import org.bigbluebutton.lib.video.commands.ShareCameraSignal;
	import org.bigbluebutton.lib.video.services.IVideoConnection;
	import org.bigbluebutton.lib.video.services.VideoConnection;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneCommand;
	import org.bigbluebutton.lib.voice.commands.ShareMicrophoneSignal;
	import org.bigbluebutton.lib.voice.services.IVoiceConnection;
	import org.bigbluebutton.lib.voice.services.VoiceConnection;
	
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
			injector.map(IUserUISession).toSingleton(UserUISession);
			injector.map(IUserSession).toSingleton(UserSession);
			injector.map(IConferenceParameters).toSingleton(ConferenceParameters);
			injector.map(IUsersService).toSingleton(UsersService);
			injector.map(IChatMessageService).toSingleton(ChatMessageService);
			injector.map(IPresentationService).toSingleton(PresentationService);
			injector.map(IChatMessagesSession).toSingleton(ChatMessagesSession);
			injector.map(IDeskshareConnection).toSingleton(DeskshareConnection);
			injector.map(ISaveData).toSingleton(SaveData);
			// Type mapping
			injector.map(IBaseConnection).toType(BaseConnection);
			injector.map(IVoiceConnection).toType(VoiceConnection);
			injector.map(ILoginService).toType(LoginService);
			injector.map(IBigBlueButtonConnection).toType(BigBlueButtonConnection);
			injector.map(IVideoConnection).toType(VideoConnection);
			// Signal to Command mapping
			signalCommandMap.map(ConnectSignal).toCommand(ConnectCommand);
			signalCommandMap.map(ConnectingFinishedSignal).toCommand(ConnectingFinishedCommandAIR);
			signalCommandMap.map(AuthenticationSignal).toCommand(AuthenticationCommandAIR);
			signalCommandMap.map(ShareMicrophoneSignal).toCommand(ShareMicrophoneCommand);
			signalCommandMap.map(ShareCameraSignal).toCommand(ShareCameraCommand);
			signalCommandMap.map(LoadSlideSignal).toCommand(LoadSlideCommand);
			signalCommandMap.map(CameraQualitySignal).toCommand(CameraQualityCommand);
			signalCommandMap.map(DisconnectUserSignal).toCommand(DisconnectUserCommandAIR);
		}
	}
}
