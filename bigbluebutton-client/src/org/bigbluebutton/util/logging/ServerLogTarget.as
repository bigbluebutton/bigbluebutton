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
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.TimerEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.utils.Timer;

	import org.as3commons.lang.ArrayUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getLogger;
	import org.as3commons.logging.setup.target.IFormattingLogTarget;
	import org.as3commons.logging.util.LogMessageFormatter;
	import org.bigbluebutton.core.UsersUtil;

	public class ServerLogTarget implements IFormattingLogTarget
	{
		private var _serverUri:String;

		/** Default format used if non is passed in */
		public static const DEFAULT_FORMAT:String="{logTime}{gmt} {message}";

		/** Logger used to notify if JSNLog doesn't work */
		private static const LOGGER:ILogger=getLogger(ServerLogTarget);

		/** Formatter used to format the message */
		private var _formatter:LogMessageFormatter;

		private var _timer:Timer;

		private var _logPattern:String;

		/** A flag to check whether */
		private var _sending:Boolean;

		// URL Variables
		private const CLIENT:String="flex3";

		private var _request:URLRequest;

		/** Not sent message will be queued in this array until all conditions making their sending possible are met */
		private var _queue:Array;

		public function ServerLogTarget(uri:String, logPattern:String)
		{
			_serverUri=uri;
			_queue=[];
			_logPattern=logPattern;
		}

		public function set format(format:String):void
		{
			//_formatter=new LogMessageFormatter(DEFAULT_FORMAT);
			_formatter=new LogMessageFormatter(format || DEFAULT_FORMAT);
		}

		public function log(name:String, shortName:String, level:int, timeStamp:Number, message:*, parameters:Array, person:String):void
		{
			var userId:String = UsersUtil.getMyUserID();
			var meetingId:String = UsersUtil.getInternalMeetingID();
			name = userId + " " + meetingId; // + " " + name;
			var formattedMessage:String=_formatter.format(name, shortName, level, timeStamp, message, parameters, person);

			// check if contains info from config field
			var reg1:RegExp = new RegExp(_logPattern, "g");
			if(reg1.test(formattedMessage)) { // only log messages of the specified pattern
				if (meetingId != null && userId != "UNKNOWN USER") {

					// We will always recycle the URLRequest instance and use it to send logging HTTP requests
					if (!_request)
					{
						_request=new URLRequest(_serverUri + "/" + CLIENT + "/" + meetingId + "/" + userId);
						_request.method=URLRequestMethod.POST;
					}
					var JsonObj:String = JSON.stringify(formattedMessage);
					_request.contentType = "application/json";

					_request.data=JsonObj;

					var loader:URLLoader=new URLLoader();
					loader.addEventListener(IOErrorEvent.IO_ERROR, function(event:IOErrorEvent):void
					{
						addToQueue(formattedMessage)
					});
					loader.load(_request);
				}
				else
				{
					addToQueue(formattedMessage);
				}
			}
		}

		/**
		 * Adds a log message to queue list
		 */
		private function addToQueue(message:String):void
		{
			// We probably need to use shared object to locally store logs when the network is down
			if (_queue.length == 0)
			{
				_timer=new Timer(200);
				_timer.addEventListener(TimerEvent.TIMER, timerHandler);
				_timer.start();
			}
			_queue.push(message);
		}

		private function removeFromQueue(message:String):void
		{
			ArrayUtils.removeItem(_queue, message);
			if (_queue.length == 0)
			{
				_timer.stop();
				_timer.removeEventListener(TimerEvent.TIMER, timerHandler);
			}
		}

		private function timerHandler(event:TimerEvent):void
		{
			if (!_sending)
			{
				_sending=true;

				// We will alwasy recycle the URLRequest instance and use it to send logging HTTP requests
				if (!_request)
				{
					_request=new URLRequest(_serverUri + "/" + CLIENT + "/" + UsersUtil.getInternalMeetingID() + "/" + UsersUtil.getMyUserID());
					_request.method=URLRequestMethod.POST;
				}

				_request.contentType = "application/json";
				var logMessage:String = _queue[0];
				_request.data = logMessage;

				var loader:URLLoader=new URLLoader();
				loader.addEventListener(IOErrorEvent.IO_ERROR, function(event:Event):void
				{
					_sending=false;
					// swallow and wait for the next iteration
				});
				loader.addEventListener(Event.COMPLETE, function(event:Event):void
				{
					removeFromQueue(logMessage);
					_sending=false;
				});
				loader.load(_request);
			}
		}
	}
}
