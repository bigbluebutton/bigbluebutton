package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class WebRTCEchoTest implements ITestable
	{
		public static var WEBRTC_ECHO_TEST:String="WebRTC Echo Test";

		private var _testSuccessfull:Boolean;
		private var _testResult:String;

		private var _webRTCEchoTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			webRTCEchoTestSuccessfullChangedSignal.dispatch();
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get webRTCEchoTestSuccessfullChangedSignal():ISignal
		{
			return _webRTCEchoTestSuccessfullChangedSignal;
		}
	}
}
