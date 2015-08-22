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
	import flash.events.IOErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getLogger;
	import org.as3commons.logging.setup.target.IFormattingLogTarget;
	import org.as3commons.logging.util.LogMessageFormatter;
	import org.bigbluebutton.core.UsersUtil;

	public class ServerLogTarget implements IFormattingLogTarget
	{
		private var _serverUri:String;

		/** Default format used if non is passed in */
		public static const DEFAULT_FORMAT:String="{time} {shortName}{atPerson} {message}";

		/** Logger used to notify if JSNLog doesn't work */
		private static const LOGGER:ILogger=getLogger(ServerLogTarget);

		/** Formatter used to format the message */
		private var _formatter:LogMessageFormatter;

		// URL Variables
		private const CLIENT:String="flex3";

		private var _variables:URLVariables;

		private var _request:URLRequest;

		/** Not sent message will be queued in this array until all conditions making their sending possible are met */
		private var _queue:Array;

		public function ServerLogTarget(uri:String)
		{
			_serverUri=uri;
			_variables=new URLVariables();
		}

		public function set format(format:String):void
		{
			_formatter=new LogMessageFormatter(format || DEFAULT_FORMAT);
		}

		public function log(name:String, shortName:String, level:int, timeStamp:Number, message:*, parameters:Array, person:String):void
		{
			var formattedMessage:String=_formatter.format(name, shortName, level, timeStamp, message, parameters, person);

			if (UsersUtil.getInternalMeetingID() != null && UsersUtil.getMyUserID() != "UNKNOWN USER")
			{
				_variables.message=formattedMessage;

				// We will alwasy recycle the URLRequest instance and use it to send logging HTTP requests
				if (!_request)
				{
					_request=new URLRequest(_serverUri + "/" + CLIENT + "/" + UsersUtil.getInternalMeetingID() + "/" + UsersUtil.getMyUserID());
					_request.method=URLRequestMethod.POST;
				}
				_request.data=_variables;

				var loader:URLLoader=new URLLoader();
				loader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorEventHandler);
				loader.load(_request);
			}
			else {
				addToQueue(formattedMessage);
			}
		}

		public function ioErrorEventHandler(event:IOErrorEvent):void
		{
			// @TODO : add to queue and check with time if the connection is back
		}
		
		/**
		 * Adds a log message to queue list 
		 */
		private function addToQueue(message : String) : void {
			_queue.push(message);
		}
	}
}
