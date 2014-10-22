package org.bigbluebutton.clientcheck
{
	import org.bigbluebutton.clientcheck.command.GetConfigXMLDataCommand;
	import org.bigbluebutton.clientcheck.command.GetConfigXMLDataSignal;
	import org.bigbluebutton.clientcheck.command.RequestBandwidthInfoCommand;
	import org.bigbluebutton.clientcheck.command.RequestBandwidthInfoSignal;
	import org.bigbluebutton.clientcheck.command.RequestBrowserInfoCommand;
	import org.bigbluebutton.clientcheck.command.RequestBrowserInfoSignal;
	import org.bigbluebutton.clientcheck.command.RequestPortsCommand;
	import org.bigbluebutton.clientcheck.command.RequestPortsSignal;
	import org.bigbluebutton.clientcheck.command.RequestRTMPAppsCommand;
	import org.bigbluebutton.clientcheck.command.RequestRTMPAppsSignal;
	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.IXMLConfig;
	import org.bigbluebutton.clientcheck.model.SystemConfiguration;
	import org.bigbluebutton.clientcheck.model.XMLConfig;
	import org.bigbluebutton.clientcheck.service.DownloadBandwidthService;
	import org.bigbluebutton.clientcheck.service.ExternalApiCallbacks;
	import org.bigbluebutton.clientcheck.service.ExternalApiCalls;
	import org.bigbluebutton.clientcheck.service.FlashService;
	import org.bigbluebutton.clientcheck.service.IDownloadBandwidthService;
	import org.bigbluebutton.clientcheck.service.IExternalApiCallbacks;
	import org.bigbluebutton.clientcheck.service.IExternalApiCalls;
	import org.bigbluebutton.clientcheck.service.IFlashService;
	import org.bigbluebutton.clientcheck.service.IPingService;
	import org.bigbluebutton.clientcheck.service.IPortTunnelingService;
	import org.bigbluebutton.clientcheck.service.IRTMPTunnelingService;
	import org.bigbluebutton.clientcheck.service.IUploadBandwidthService;
	import org.bigbluebutton.clientcheck.service.PingService;
	import org.bigbluebutton.clientcheck.service.PortTunnelingService;
	import org.bigbluebutton.clientcheck.service.RTMPTunnelingService;
	import org.bigbluebutton.clientcheck.service.UploadBandwidthService;

	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;

	public class AppConfig implements IConfig
	{
		[Inject]
		public var injector:IInjector;

		[Inject]
		public var signalCommandMap:ISignalCommandMap;

		public function configure():void
		{
			configureSignalsToCommands();
			configureSingletons();
			configureTypes();
		}

		private function configureTypes():void
		{
			injector.map(IExternalApiCalls).toType(ExternalApiCalls);
			injector.map(IExternalApiCallbacks).toType(ExternalApiCallbacks);
			injector.map(IRTMPTunnelingService).toType(RTMPTunnelingService);
			injector.map(IPortTunnelingService).toType(PortTunnelingService);
			injector.map(IDownloadBandwidthService).toType(DownloadBandwidthService);
			injector.map(IUploadBandwidthService).toType(UploadBandwidthService);
			injector.map(IPingService).toType(PingService);
			injector.map(IFlashService).toType(FlashService);
		}

		private function configureSingletons():void
		{
			injector.map(ISystemConfiguration).toSingleton(SystemConfiguration);
			injector.map(IXMLConfig).toSingleton(XMLConfig);
		}

		private function configureSignalsToCommands():void
		{
			signalCommandMap.map(RequestPortsSignal).toCommand(RequestPortsCommand);
			signalCommandMap.map(GetConfigXMLDataSignal).toCommand(GetConfigXMLDataCommand);
			signalCommandMap.map(RequestBrowserInfoSignal).toCommand(RequestBrowserInfoCommand);
			signalCommandMap.map(RequestRTMPAppsSignal).toCommand(RequestRTMPAppsCommand);
			signalCommandMap.map(RequestBandwidthInfoSignal).toCommand(RequestBandwidthInfoCommand);
		}
	}
}
