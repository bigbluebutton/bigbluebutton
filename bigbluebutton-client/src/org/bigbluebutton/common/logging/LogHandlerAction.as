/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2018 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.common.logging {
	import com.adobe.crypto.SHA256;
	
	import flash.events.UncaughtErrorEvent;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;

	public class LogHandlerAction implements GlobalExceptionHandlerAction {
		private static const LOGGER:ILogger = getClassLogger(UncaughtErrorEvent);

		public function handle(error:Object):void {
			if (error is Error) {
				var errorObj:Error = error as Error;

				LOGGER.fatal("\nError ID : {0}\nUnique ID : {1}\nMessage : {2}\n{3}", [errorObj.errorID, SHA256.hash(errorObj.getStackTrace()).substr(0, 8), errorObj.message, errorObj.getStackTrace()]);
			}
		}
	}
}
