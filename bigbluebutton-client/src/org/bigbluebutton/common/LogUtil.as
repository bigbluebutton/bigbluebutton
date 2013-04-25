/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common
{
	import mx.logging.ILogger;
	import mx.logging.Log;
	
	public class LogUtil
	{
		public static const LOGGER:String = "BBBLOGGER";
		
		public static function debug(message:String):void
		{
			logger.debug(message);
		}

		public static function info(message:String):void
		{
			logger.info(message);
		}
		
		public static function error(message:String):void
		{
			logger.error(message);
		}

		public static function fatal(message:String):void
		{
			logger.fatal(message);
		}
		
		public static function warn(message:String):void
		{
			logger.warn(message);
		}
		
		public static function traceObject(obj : *, level : int = 0):void
		{
			var tabs : String = "";
			for ( var i : int = 0 ; i < level ; ++i ) {
				tabs += "        "
			}
			
			for ( var prop : String in obj ){
				debug( tabs + "[" + prop + "] -> " + obj[ prop ] );
				traceObject( obj[ prop ], level + 1 );
			}
		}

		private static function get logger():ILogger {
			return Log.getLogger(LOGGER);
		}
	}
}