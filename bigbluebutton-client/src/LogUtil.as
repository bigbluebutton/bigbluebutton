/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package
{
	import mx.logging.ILogger;
	import mx.logging.Log;
	
	import org.bigbluebutton.common.Constants;
	
	public class LogUtil
	{
		private static const LOGGER:String = "BBBLOGGER";
		
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
		
		private static function get logger():ILogger {
			return Log.getLogger(Constants.LOG_TARGET_NAME);
		}
	}
}