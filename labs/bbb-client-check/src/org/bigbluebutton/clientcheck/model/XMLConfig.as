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
	}
}
