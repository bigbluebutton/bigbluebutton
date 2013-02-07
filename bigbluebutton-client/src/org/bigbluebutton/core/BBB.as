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
package org.bigbluebutton.core
{
	import org.bigbluebutton.core.managers.ConfigManager2;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.managers.UserConfigManager;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.core.model.Session;
	import flash.system.Capabilities;
	
	public class BBB {
		private static var configManager:ConfigManager2 = null;
		private static var connectionManager:ConnectionManager = null;
		private static var session:Session = null;
		private static var userConfigManager:UserConfigManager = null;
			
		public static function initUserConfigManager():UserConfigManager {
			if (userConfigManager == null) {
				userConfigManager = new UserConfigManager();
			}
			return userConfigManager;
		}
		
		public static function initConfigManager():ConfigManager2 {
			if (configManager == null) {
				configManager = new ConfigManager2();
				configManager.loadConfig();
			}
			return configManager;
		}

		public static function getConfigForModule(module:String):XML {
			return initConfigManager().config.getConfigFor(module);
		}
		
		public static function initConnectionManager():ConnectionManager {
			if (connectionManager == null) {
				connectionManager = new ConnectionManager();
			}
			return connectionManager;
		}		

		public static function initSession():Session {
			if (session == null) {
				session = new Session();
			}
			return session;
		}		
		
		public static function getFlashPlayerVersion():Number {
			var versionString:String = Capabilities.version;
			var pattern:RegExp = /^(\w*) (\d*),(\d*),(\d*),(\d*)$/;
			var result:Object = pattern.exec(versionString);
			if (result != null) {
			//	trace("input: " + result.input);
			//	trace("platform: " + result[1]);
			//	trace("majorVersion: " + result[2]);
			//	trace("minorVersion: " + result[3]);    
			//	trace("buildNumber: " + result[4]);
			//	trace("internalBuildNumber: " + result[5]);
				return Number(result[2] + "." + result[3]);
			} else {
			//	trace("Unable to match RegExp.");
				return 0;
			}		
		}
		
	}
}