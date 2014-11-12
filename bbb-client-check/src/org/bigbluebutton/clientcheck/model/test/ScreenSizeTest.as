package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class ScreenSizeTest implements ITestable
	{
		public static var SCREEN_SIZE:String="Screen size";

		private var _testSuccessfull:Boolean;
		private var _testResult:String;

		private var _screenSizeTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			_screenSizeTestSuccessfullChangedSignal.dispatch();
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get screenSizeTestSuccessfullChangedSignal():ISignal
		{
			return _screenSizeTestSuccessfullChangedSignal;
		}
	}
}
