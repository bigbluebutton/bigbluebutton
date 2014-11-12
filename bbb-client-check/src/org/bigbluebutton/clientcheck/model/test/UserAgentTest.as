package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class UserAgentTest implements ITestable
	{
		public static var USER_AGENT:String="User Agent";

		private var _testSuccessfull:Boolean;
		private var _testResult:String;

		private var _userAgentTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			_userAgentTestSuccessfullChangedSignal.dispatch();
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get userAgentTestSuccessfullChangedSignal():ISignal
		{
			return _userAgentTestSuccessfullChangedSignal;
		}
	}
}
