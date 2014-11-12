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

package org.bigbluebutton.clientcheck.model.test
{
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;

	public class RTMPAppTest implements IRTMPAppTest
	{
		private var _applicationUri:String;
		private var _applicationName:String;
		private var _testResult:String;
		private var _testSuccessfull:Boolean;

		private var _connectionResultSuccessfullChangedSignal:ISignal=new Signal();

		public function get applicationUri():String
		{
			return _applicationUri;
		}

		public function set applicationUri(value:String):void
		{
			_applicationUri=value;
		}

		public function get applicationName():String
		{
			return _applicationName;
		}

		public function set applicationName(value:String):void
		{
			_applicationName=value;
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get connectionResultSuccessfullChangedSignal():ISignal
		{
			return _connectionResultSuccessfullChangedSignal;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			_connectionResultSuccessfullChangedSignal.dispatch(applicationUri);
		}

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}
	}
}
