package org.bigbluebutton.clientcheck.model.test
{
	import org.bigbluebutton.clientcheck.model.Bandwidth;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class PingTest extends Bandwidth
	{
		public static var PING:String="Ping";

		private var _testResult:String;
		private var _testSuccessfull:Boolean;
		private var _pingSpeedTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			_pingSpeedTestSuccessfullChangedSignal.dispatch();
		}

		public function get pingSpeedTestSuccessfullChangedSignal():ISignal
		{
			return _pingSpeedTestSuccessfullChangedSignal;
		}
	}
}
