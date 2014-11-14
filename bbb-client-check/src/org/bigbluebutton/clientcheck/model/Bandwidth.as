/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

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
