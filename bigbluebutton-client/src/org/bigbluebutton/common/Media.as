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
	import flash.media.Microphone;
	
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	
	public final class Media {
		private static const LOGGER:ILogger = getClassLogger(Media);
		
		/**
		 * Returns the number of available cameras.
		 */
		public static function get availableCameras():uint {
			return Camera.names.length;
		}
		
		/**
		 * Returns tha name of Webcam.
		 */
		public static function getCameraName(index:uint):String {
			var name:String = Camera.names[index];
			if (StringUtils.isWhitespace(name)) {
				// Browser based on pepper flash receives a white space string
				// https://code.google.com/p/chromium/issues/detail?id=408404
				name = "Webcam " + (index + 1).toString();
				LOGGER.debug("Automatically set Webcam name under Pepperflash: {0}", [name]);
			}
			return name;
		}
		
		public static function getMicrophoneNames():Array {
			var microphones:Array = Microphone.names;
			for (var i:int = 0; i < microphones.length; i++) {
				if (StringUtils.isWhitespace(microphones[i])) {
					microphones[i] = "Microphone " + (i + 1).toString();
					LOGGER.debug("Automatically set Microphone name under Pepperflash: {0}", [microphones[i]]);
				}
			}
			return microphones;
		}
	}
}
