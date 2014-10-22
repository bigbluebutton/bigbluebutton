package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;

	public interface IPortTest extends ITestable
	{
		function get portNumber():int;
		function set portNumber(value:int):void;
		function get portName():String;
		function set portName(value:String):void;
		function get tunnelResultSuccessfullChangedSignal():ISignal;
	}
}
