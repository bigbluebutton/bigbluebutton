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
package org.bigbluebutton.core {

	import flash.system.Capabilities;
	
	import mx.core.FlexGlobals;
	import mx.utils.URLUtil;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.core.managers.ConfigManager2;
	import org.bigbluebutton.core.managers.ConnectionManager;
	import org.bigbluebutton.core.managers.VideoProfileManager;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.core.model.VideoProfile;
	import org.bigbluebutton.util.QueryStringParameters;

	public class BBB {
		
		private static const LOGGER:ILogger = getClassLogger(BBB);      

		private static var configManager:ConfigManager2 = null;

		private static var connectionManager:ConnectionManager = null;

		private static var videoProfileManager:VideoProfileManager = null;

		private static var queryStringParameters:QueryStringParameters = null;

		public static function getQueryStringParameters():QueryStringParameters {
			if (queryStringParameters == null) {
				queryStringParameters = new QueryStringParameters();
			}
			return queryStringParameters;
		}

		public static function getConfigManager():ConfigManager2 {
			if (configManager == null) {
				configManager = new ConfigManager2();
			}
			return configManager;
		}

		public static function loadConfig():void {
			configManager.loadConfig();
		}

		public static function initVideoProfileManager():VideoProfileManager {
			if (videoProfileManager == null) {
				videoProfileManager = new VideoProfileManager();
				videoProfileManager.loadProfiles();
			}
			return videoProfileManager;
		}

		public static function getConfigForModule(module:String):XML {
			return getConfigManager().config.getConfigFor(module);
		}

		public static function get videoProfiles():Array {
			return initVideoProfileManager().profiles;
		}

		public static function getVideoProfileById(id:String):VideoProfile {
			return initVideoProfileManager().getVideoProfileById(id);
		}

		public static function get defaultVideoProfile():VideoProfile {
			return initVideoProfileManager().defaultVideoProfile;
		}

		public static function get fallbackVideoProfile():VideoProfile {
			return initVideoProfileManager().fallbackVideoProfile;
		}

		public static function initConnectionManager():ConnectionManager {
			if (connectionManager == null) {
				connectionManager = new ConnectionManager();
			}
			return connectionManager;
		}

		public static function getFlashPlayerVersion():Number {
			var versionString:String = Capabilities.version;
			var pattern:RegExp = /^(\w*) (\d*),(\d*),(\d*),(\d*)$/;
			var result:Object = pattern.exec(versionString);
			if (result != null) {
				return Number(result[2] + "." + result[3]);
			} else {
				LOGGER.warn("Unable to match RegExp.");
				return 0;
			}
		}

		public static function getLogoutURL():String {
			var logoutUrl:String = LiveMeeting.inst().me.logoutURL;
			if (logoutUrl == null) {
				logoutUrl = getBaseURL();
			}
			return logoutUrl;
		}

		public static function getSignoutURL():String {
			var sessionToken:String = getQueryStringParameters().getSessionToken();
			var logoutUrl:String = getBaseURL();
			if (sessionToken != "") {
				logoutUrl += "/bigbluebutton/api/signOut?sessionToken=" + sessionToken;
			}
			return logoutUrl;
		}

		public static function getBaseURL():String {
			return FlexGlobals.topLevelApplication.loaderInfo.parameters.origin
		}
	}
}
