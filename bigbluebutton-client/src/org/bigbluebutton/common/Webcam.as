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
package org.bigbluebutton.common {
	
	import flash.media.Camera;
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	
	public final class Webcam {
		private static const LOGGER:ILogger = getClassLogger(Webcam);
		
		/**
		 * Returns the number of available cameras.
		 */
		public static function get availableCameras():uint {
			return Camera.names.length;
		}
		
		/**
		 * Returns tha name of Webcam.
		 */
		public static function getName(index:uint):String {
			var name:String = Camera.names[index];
			if (StringUtils.isWhitespace(name)) {
				// Browser based on pepper flash receives a white space string
				// https://code.google.com/p/chromium/issues/detail?id=408404
				name = "Webcam " + (index + 1).toString();
				LOGGER.debug("Automatically set Webcam name under Pepperflash: {0}", [name]);
			}
			return name;
		}
	}
}
