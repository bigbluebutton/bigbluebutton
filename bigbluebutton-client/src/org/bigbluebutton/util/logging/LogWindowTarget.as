/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.util.logging
{
	import flash.utils.setTimeout;
	
	import mx.collections.ArrayCollection;
	import mx.core.FlexGlobals;
	
	import org.as3commons.logging.setup.target.IFormattingLogTarget;
	import org.as3commons.logging.util.LogMessageFormatter;
	import org.bigbluebutton.main.views.LogWindow;

	public class LogWindowTarget implements IFormattingLogTarget
	{
		/** Default format used if non is passed in */
		public static const DEFAULT_FORMAT:String="{time} {shortName}{atPerson} {message}";

		/** Formatter used to format the message */
		private var _formatter:LogMessageFormatter;

		private var _logWindow:LogWindow;

		private var logMessages:ArrayCollection;

		public static const MAX_NUM_MESSAGES:int=2000;

		public function clear():void
		{
			logMessages.removeAll();
		}

		public function get messages():String
		{
			var m:String="";

			for (var i:int=0; i < logMessages.length; i++)
			{
				m+=logMessages.getItemAt(i);
			}

			return m;
		}

		public function LogWindowTarget()
		{
			checkLogWindow();
			this.logMessages=new ArrayCollection();
		}

		private function checkLogWindow():void
		{
			if (!_logWindow)
			{
				if (FlexGlobals.topLevelApplication.bbbShell["mainShell"])
				{
					_logWindow=FlexGlobals.topLevelApplication.bbbShell["mainShell"]["getLogWindow"]();
				}
				setTimeout(checkLogWindow, 50);
			}
		}

		/**
		 * @inheritDoc
		 */
		public function set format(format:String):void
		{
			_formatter=new LogMessageFormatter(format || DEFAULT_FORMAT);
		}

		/**
		 * @inheritDoc
		 */
		public function log(name:String, shortName:String, level:int, timeStamp:Number, message:*, parameters:Array, person:String):void
		{
			// check message queue length
			if (logMessages.length >= MAX_NUM_MESSAGES)
			{
				logMessages.removeItemAt(0);
			}
			logMessages.addItem(_formatter.format(name, shortName, level, timeStamp, message, parameters, person) + "\n");

			// check if log window is ready
			if (this._logWindow && this._logWindow.txtOutput)
			{
				this._logWindow.txtOutput.text=messages;
			}
		}
	}
}
