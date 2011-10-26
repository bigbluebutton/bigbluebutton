package org.bigbluebutton.core
{
	import org.bigbluebutton.core.managers.ConfigManager2;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.managers.StreamManager;
	import org.bigbluebutton.core.managers.UserConfigManager;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.core.model.Session;
	import flash.system.Capabilities;
	
	public class BBB {
		private static var configManager:ConfigManager2 = null;
		private static var streamManager:StreamManager = null;
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
		
		public static function initStreamManager():StreamManager {
			if (streamManager == null) {
				streamManager = new StreamManager();
			}
			return streamManager;
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