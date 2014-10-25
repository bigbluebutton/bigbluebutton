package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;

	public interface IRTMPAppTest extends ITestable
	{
		function get applicationUri():String;
		function set applicationUri(value:String):void;
		function get applicationName():String;
		function set applicationName(value:String):void;
		function get connectionResultSuccessfullChangedSignal():ISignal;
	}
}
