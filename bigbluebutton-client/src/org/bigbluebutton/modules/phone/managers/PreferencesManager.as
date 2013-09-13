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
package org.bigbluebutton.modules.phone.managers
{
	import flash.events.EventDispatcher;
	import org.bigbluebutton.core.events.ErrorEvent;
	
	public class PreferencesManager extends EventDispatcher {
		private static var sharedObject:SharedObject = SharedObject.getLocal("BBBUserPreferences", "/");
		
		public function savePreference(key:String, value:Object):void{
			sharedObject.data[key] = value;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				dispatchEvent(new ErrorEvent("SavingErrorEvent", true, true));
			}
		}
		
		public function getPreference(key:String):Object {
			return sharedObject.data[key];
		}
	}
}
