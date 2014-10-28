package org.bigbluebutton.clientcheck.model
{

	public class Bandwidth
	{
		private var _filePath:String;
		private var _testResultArray:Array=new Array;
		private var _testsCount:Number;
		private var _startTime:uint;
		private var _endTime:uint;

		public function get filePath():String
		{
			return _filePath;
		}

		public function set filePath(value:String):void
		{
			_filePath=value;
		}

		public function get testsCount():Number
		{
			return _testsCount;
		}

		public function set testsCount(value:Number):void
		{
			_testsCount=value;
		}

		public function get startTime():uint
		{
			return _startTime;
		}

		public function set startTime(value:uint):void
		{
			_startTime=value;
		}

		public function get endTime():uint
		{
			return _endTime;
		}

		public function set endTime(value:uint):void
		{
			_endTime=value;
		}

		public function get testResultArray():Array
		{
			return _testResultArray;
		}

		public function set testResultArray(value:Array):void
		{
			_testResultArray=value;
		}
	}
}
