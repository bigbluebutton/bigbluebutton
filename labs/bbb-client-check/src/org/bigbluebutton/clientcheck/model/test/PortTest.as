package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class PortTest implements IPortTest
	{
		private var _testSuccessfull:Boolean;
		private var _tunnelResultSuccessfullChangedSignal:ISignal=new Signal();

		private var _portNumber:int;
		private var _portName:String;
		private var _testResult:String;

		public function get portNumber():int
		{
			return _portNumber;
		}

		public function set portNumber(value:int):void
		{
			_portNumber=value;
		}

		public function get portName():String
		{
			return _portName;
		}

		public function set portName(value:String):void
		{
			_portName=value;
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			_tunnelResultSuccessfullChangedSignal.dispatch(portNumber);
		}

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function get tunnelResultSuccessfullChangedSignal():ISignal
		{
			return _tunnelResultSuccessfullChangedSignal;
		}
	}
}
