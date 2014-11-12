package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class FlashVersionTest implements ITestable
	{
		public static var FLASH_VERSION:String="Flash Version";

		private var _testSuccessfull:Boolean;
		private var _testResult:String;

		private var _flashVersionTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			flashVersionTestSuccessfullChangedSignal.dispatch();
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get flashVersionTestSuccessfullChangedSignal():ISignal
		{
			return _flashVersionTestSuccessfullChangedSignal;
		}
	}
}
