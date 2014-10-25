package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.Signal;
	import org.osflash.signals.ISignal;

	public class IsPepperFlashTest implements ITestable
	{
		public static var PEPPER_FLASH:String="Is Pepper Flash";

		private var _testSuccessfull:Boolean;
		private var _testResult:String;

		private var _pepperFlashTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			pepperFlashTestSuccessfullChangedSignal.dispatch();
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get pepperFlashTestSuccessfullChangedSignal():ISignal
		{
			return _pepperFlashTestSuccessfullChangedSignal;
		}
	}
}
