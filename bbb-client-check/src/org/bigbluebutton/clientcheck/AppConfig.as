/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
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
	import org.bigbluebutton.clientcheck.model.IDataProvider;
	import org.bigbluebutton.clientcheck.model.SystemConfiguration;
	import org.bigbluebutton.clientcheck.model.XMLConfig;
	import org.bigbluebutton.clientcheck.model.DataProvider;
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
			injector.map(IDataProvider).toSingleton(DataProvider);
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
