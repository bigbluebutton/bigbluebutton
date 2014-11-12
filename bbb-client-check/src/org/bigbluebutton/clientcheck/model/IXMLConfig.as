package org.bigbluebutton.clientcheck.model
{
	import org.osflash.signals.ISignal;

	public interface IXMLConfig
	{
		function init(config:XML):void;
		function get configParsedSignal():ISignal;
		function get downloadFilePath():Object;
		function get serverUrl():Object;
		function getPorts():XMLList;
		function getRTMPApps():XMLList;
	}
}
