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
	import flash.external.ExternalInterface;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getLogger;
	import org.as3commons.logging.level.DEBUG;
	import org.as3commons.logging.level.ERROR;
	import org.as3commons.logging.level.FATAL;
	import org.as3commons.logging.level.INFO;
	import org.as3commons.logging.level.WARN;
	import org.as3commons.logging.setup.target.IFormattingLogTarget;
	import org.as3commons.logging.util.LogMessageFormatter;

	public class JSNLogTarget implements IFormattingLogTarget
	{
		/** Default format used if non is passed in */
		public static const DEFAULT_FORMAT:String="{time} {shortName}{atPerson} {message}";

		/** Logger used to notify if JSNLog doesn't work */
		private static const LOGGER:ILogger=getLogger(JSNLogTarget);

		/** Appender to console */
		public static const CONSOLE:String="appender.console";

		/** True if the external interface was inited */
		private static var _inited:Boolean=false;

		/** True if the console is available */
		private static var _available:Boolean=true;

		/** Formatter used to format the message */
		private var _formatter:LogMessageFormatter;

		private var _appender:String;

		private var _params:Array;

		/**
		 * Creates new <code>JSNLogTarget</code>
		 *
		 * @param format Format to be used
		 */
		public function JSNLogTarget(format:String=null, appender:String=CONSOLE)
		{
			this.format=format;
			this._appender=appender;
		}

		/**
		 * @inheritDoc
		 */
		public function set format(format:String):void
		{
			_formatter=new LogMessageFormatter(format || DEFAULT_FORMAT);
		}

		/**
		 * Inits the External Interface
		 */
		private function init():void
		{
			_inited=true;
			if (_available=ExternalInterface.available)
			{
				try
				{
					if (!ExternalInterface.call('function(){ return typeof(JL) == "function" ? true : false; }'))
					{
						LOGGER.warn("JSNLog library not found in the HTML application wrapper.");
						_available=false;
					}
					if (_available)
					{
						switch (this._appender)
						{
							case CONSOLE:
							{
								// we create the console appender
								ExternalInterface.call('function(){ var consoleAppender=JL.createConsoleAppender("consoleAppender");JL("' + this._appender + '").setOptions({"appenders": [consoleAppender]});}');
								break;
							}

							default:
							{
								break;
							}
						}
					}
				}
				catch (e:Error)
				{
					LOGGER.warn("Could not setup JSNLogTarget, exception while setup {0}", [e]);
					_available=false;
				}
			}
			else
			{
				LOGGER.warn("Could not setup JSNLogTarget, because ExternalInterface wasn't available");
			}
		}

		/**
		 * @inheritDoc
		 */
		public function log(name:String, shortName:String, level:int, timeStamp:Number, message:*, parameters:Array, person:String):void
		{
			if (!_inited)
			{
				init();
			}
			if (_available)
			{
				// Select the matching method
				var method:String;
				switch (level)
				{
					case INFO:
					{
						method="JL('" + this._appender + "').info";
						break;
					}
					case DEBUG:
					{
						method="JL('" + this._appender + "').debug";
						break;
					}
					case WARN:
					{
						method="JL('" + this._appender + "').warn";
						break;
					}
					case ERROR:
					{
						method="JL('" + this._appender + "').error";
						break;
					}
					case FATAL:
					{
						method="JL('" + this._appender + "').fatal";
						break;
					}

					default:
					{
						break;
					}
				}

				_params=[method, null];

				_params[1]=_formatter.format(name, shortName, level, timeStamp, message, parameters, person).split("\\").join("\\\\");

				try
				{
					// Send it out!
					ExternalInterface.call.apply(ExternalInterface, _params);
				}
				catch (e:Error)
				{
				}
			}
		}
	}
}
