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

	import mx.resources.ResourceManager;

	public class BrowserTest implements ITestable
	{
		public static var BROWSER:String=ResourceManager.getInstance().getString('resources', 'bbbsystemcheck.test.name.browser');

		private var _testSuccessfull:Boolean;
		private var _testResult:String;
		private var _testMessage:String = "";

		private var _browserTestSuccessfullChangedSignal:ISignal=new Signal;

		public function get testSuccessfull():Boolean
		{
			return _testSuccessfull;
		}

		public function set testSuccessfull(value:Boolean):void
		{
			_testSuccessfull=value;
			_browserTestSuccessfullChangedSignal.dispatch();
		}

		public function get testResult():String
		{
			return _testResult;
		}

		public function set testResult(value:String):void
		{
			_testResult=value;
		}

		public function get testMessage():String
		{
			return _testMessage;
		}

		public function set testMessage(value:String):void
		{
			_testMessage=value;
		}

		public function get browserTestSuccessfullChangedSignal():ISignal
		{
			return _browserTestSuccessfullChangedSignal;
		}

		public function isBrowserUpdated(thisVersion:String, latestVersion:String):Boolean
		{
			var tversion:Array = thisVersion.split(".");
			var lversion:Array = latestVersion.split(".");

			var size:int = (tversion.length <= lversion.length) ? tversion.length : lversion.length;

			for (var i:int = 0; i < size; i++) {
				if (Number(tversion[i]) < Number(lversion[i])) {
					return false;
				}
			}

			return true;
		}
	}
}
