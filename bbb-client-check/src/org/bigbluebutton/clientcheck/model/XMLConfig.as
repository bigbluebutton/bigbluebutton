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

package org.bigbluebutton.clientcheck.model
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class XMLConfig implements IXMLConfig
	{
		private var _config:XML;
		private var _configParsedSignal:ISignal=new Signal;

		public function init(config:XML):void
		{
			_config=config;
		}

		public function get configParsedSignal():ISignal
		{
			return _configParsedSignal;
		}

		public function get downloadFilePath():Object
		{
			var downloadFilePath:Object=new Object();
			downloadFilePath.url=_config.downloadFilePath.@url;
			return downloadFilePath;
		}

		public function get serverUrl():Object
		{
			var serverUrl:Object=new Object();
			serverUrl.url=_config.server.@url;
			return serverUrl;
		}

		public function getPorts():XMLList
		{
			return new XMLList(_config.ports).children();
		}

		public function getRTMPApps():XMLList
		{
			return new XMLList(_config.rtmpapps).children();
		}

		public function getVersion():String
		{
			var version:String = _config.version;
			return version;
		}

		public function getMail():String
		{
			var mail:String = _config.mail;
			return mail;
		}

		public function getChromeLatestVersion():String
		{
			var version:String = _config.chromeLatestVersion;
			return version;
		}

		public function getFirefoxLatestVersion():String
		{
			var version:String = _config.firefoxLatestVersion;
			return version;
		}
	}
}
