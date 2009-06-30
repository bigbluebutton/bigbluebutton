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
package org.bigbluebutton.util.logging
{
	import mx.logging.ILogger;
	import mx.logging.Log;
	import mx.logging.LogEventLevel;
	
	import org.bigbluebutton.common.Constants;
	
	public class Logger
	{
		private var target:ArrayCollectionLogTarget = new ArrayCollectionLogTarget();
		
		public function Logger()
		{
			target.filters = ["*"];
			target.level = LogEventLevel.ALL;
			target.includeTime = true;
			target.includeDate = true;
			//target.includeCategory = true;
			target.includeLevel = true;
			logger.debug("initialization");
		}
			
		public function enableLogging(enabled:Boolean):void {
			if (enabled) {
				Log.addTarget(target);
				logger.info("Turned logging on");
			} else {
				logger.info("Turning logging off");
				Log.removeTarget(target);
			}
		}
			
		public function changeFilterTarget(newFilters:Array):void {
			logger.info("Filter change!");
			Log.removeTarget(target);
			target.filters = newFilters;
			if (target.filters == null) 
				target.filters = ["*"];
			Log.addTarget(target);
		}
		
		public function get messages():String {
			return target.messages;
		}	
		
		private static function get logger():ILogger {
			return Log.getLogger(Constants.LOG_TARGET_NAME);
		}
	}
}