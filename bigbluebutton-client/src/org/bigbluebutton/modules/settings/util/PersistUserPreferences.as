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
package org.bigbluebutton.modules.settings.util
{
	import flash.net.SharedObject;

	public class PersistUserPreferences
	{
		private static var sharedObject:SharedObject = SharedObject.getLocal("bbbUserProperties", "/");
		
		public static function storeData(preference:String, data:String):void{
			sharedObject.data[preference] = data;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveWebcamPreference(webcam:String):void{
			sharedObject.data["webcam"] = webcam;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveMicrophonePreference(microphone:String):void{
			sharedObject.data["microphone"] = microphone;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveMicrophoneGain(gain:Number):void{
			if (gain > 100 || gain < 0) return;
			
			sharedObject.data["gain"] = gain;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveSettingsVisited():void{
			sharedObject.data["previouslyvisited"] = true;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
	}
}