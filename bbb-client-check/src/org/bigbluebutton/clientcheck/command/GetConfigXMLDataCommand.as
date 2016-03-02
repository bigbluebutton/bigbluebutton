/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.clientcheck.command
{
	import flash.net.URLRequest;
	import flash.utils.getTimer;

	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	import mx.utils.URLUtil;

	import org.bigbluebutton.clientcheck.model.ISystemConfiguration;
	import org.bigbluebutton.clientcheck.model.IXMLConfig;
	import org.bigbluebutton.clientcheck.model.test.IPortTest;
	import org.bigbluebutton.clientcheck.model.test.IRTMPAppTest;
	import org.bigbluebutton.clientcheck.model.test.PortTest;
	import org.bigbluebutton.clientcheck.model.test.RTMPAppTest;
	import org.bigbluebutton.clientcheck.service.ConfigService;

	import robotlegs.bender.bundles.mvcs.Command;

	public class GetConfigXMLDataCommand extends Command
	{
		[Inject]
		public var systemConfiguration:ISystemConfiguration;

		[Inject]
		public var config:IXMLConfig;

		private var CONFIG_XML:String="check/conf/config.xml";
		private var _urlRequest:URLRequest;

		public override function execute():void
		{
			var configSubservice:ConfigService=new ConfigService();

			configSubservice.successSignal.add(afterConfig);
			configSubservice.unsuccessSignal.add(fail);
			configSubservice.getConfig(buildRequestURL(), _urlRequest);
		}

		private function buildRequestURL():String
		{
			var swfPath:String=FlexGlobals.topLevelApplication.url;
			var protocol:String=URLUtil.getProtocol(swfPath);
			systemConfiguration.serverName=URLUtil.getServerNameWithPort(swfPath);

			return protocol + "://" + systemConfiguration.serverName + "/" + CONFIG_XML + "?t=" + getTimer().toString();
		}

		private function fail(reason:String):void
		{
			// TODO: create pop up to notify about failure
		}

		private function afterConfig(data:Object):void
		{
			config.init(new XML(data));
			systemConfiguration.downloadFilePath=config.downloadFilePath.url;
			systemConfiguration.applicationAddress=config.serverUrl.url;

			for each (var _port:Object in config.getPorts())
			{
				var port:IPortTest=new PortTest();
				port.portName=ResourceManager.getInstance().getString('resources', _port.name);
				if (port.portName == "undefined") port.portName = _port.name;
				port.portNumber=_port.number;
				systemConfiguration.ports.push(port);
			}

			for each (var _rtmpApp:Object in config.getRTMPApps())
			{
				var app:IRTMPAppTest=new RTMPAppTest();
				app.applicationName=ResourceManager.getInstance().getString('resources', _rtmpApp.name);
				if (app.applicationName == "undefined") app.applicationName = _rtmpApp.name;
				app.applicationUri=_rtmpApp.uri;
				systemConfiguration.rtmpApps.push(app);
			}

			config.configParsedSignal.dispatch();
		}
	}
}
