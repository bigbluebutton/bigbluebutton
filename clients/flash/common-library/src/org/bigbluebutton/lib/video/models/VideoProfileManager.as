package org.bigbluebutton.lib.video.models {
	import flash.events.EventDispatcher;
	
	public class VideoProfileManager extends EventDispatcher {
		public static const PROFILES_XML:String = "client/conf/profiles.xml";
		
		public static const DEFAULT_FALLBACK_LOCALE:String = "en_US";
		
		private var _profiles:Array = new Array();
		
		public function parseProfilesXml(profileXML:XML):void {
			// first clear the array
			_profiles.splice(0);
			var fallbackLocale:String = profileXML.@fallbackLocale != undefined ? profileXML.@fallbackLocale.toString() : DEFAULT_FALLBACK_LOCALE;
			for each (var profile:XML in profileXML.children()) {
				_profiles.push(new VideoProfile(profile, fallbackLocale));
			}
		}
		
		public function parseConfigXml(configXML:XML):void {
			var resolutionsString:String = configXML.@resolutions;
			var resolutions:Array = resolutionsString.split(",");
			for (var resolution:String in resolutions) {
				var profileXml:XML = <profile></profile>
				profileXml.@['id'] = resolutions[resolution];
				profileXml.locale.en_US = resolutions[resolution];
				profileXml.width = resolutions[resolution].split("x")[0];
				profileXml.height = resolutions[resolution].split("x")[1];
				profileXml.keyFrameInterval = configXML.@camKeyFrameInterval;
				profileXml.modeFps = configXML.@camModeFps;
				profileXml.qualityBandwidth = configXML.@camQualityBandwidth;
				profileXml.qualityPicture = configXML.@camQualityPicture;
				profileXml.enableH264 = configXML.@enableH264;
				profileXml.h264Level = configXML.@h264Level;
				profileXml.h264Profile = configXML.@h264Profile;
				var profile:VideoProfile = new VideoProfile(profileXml, DEFAULT_FALLBACK_LOCALE);
				_profiles.push(profile);
			}
		}
		
		public function get profiles():Array {
			if (_profiles.length > 0) {
				return _profiles;
			} else {
				return [fallbackVideoProfile];
			}
		}
		
		public function getVideoProfileById(id:String):VideoProfile {
			for each (var profile:VideoProfile in profiles) {
				if (profile.id == id) {
					return profile;
				}
			}
			return null;
		}
		
		public function getVideoProfileByStreamName(streamName:String):VideoProfile {
			var pattern:RegExp = new RegExp("([a-z0-9]+)-([A-Za-z0-9_]+)-\\d+", "");
			if (pattern.test(streamName)) {
				var profileID:String = pattern.exec(streamName)[1]
				for each (var profile:VideoProfile in _profiles) {
					if (profile.id == profileID) {
						return profile;
					}
				}
				return null;
			} else {
				return null;
			}
		}
		
		public function get defaultVideoProfile():VideoProfile {
			for each (var profile:VideoProfile in _profiles) {
				if (profile.defaultProfile) {
					return profile;
				}
			}
			if (_profiles.length > 0) {
				return _profiles[0];
			} else {
				return fallbackVideoProfile;
			}
		}
		
		public function get fallbackVideoProfile():VideoProfile {
			return new VideoProfile(<profile id="160x120" default="true">
					<locale>
						<en_US>Fallback profile</en_US>
					</locale>
					<width>160</width>
					<height>120</height>
					<keyFrameInterval>5</keyFrameInterval>
					<modeFps>10</modeFps>
					<qualityBandwidth>0</qualityBandwidth>
					<qualityPicture>90</qualityPicture>
					<enableH264>true</enableH264>
					<h264Level>2.1</h264Level>
					<h264Profile>main</h264Profile>
				</profile>, DEFAULT_FALLBACK_LOCALE);
		}
		
		public function getProfileWithLowerResolution():VideoProfile {
			if (_profiles.lenth <= 0) {
				return fallbackVideoProfile;
			}
			var lower:VideoProfile = _profiles[0];
			for each (var profile:VideoProfile in _profiles) {
				if (((profile.width) * (profile.height)) < ((lower.width) * (lower.height))) {
					lower = profile;
				}
			}
			return lower;
		}
	}
}
