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
package org.bigbluebutton.core.managers
{
    import flash.events.Event;
    import flash.events.EventDispatcher;
    import flash.net.URLLoader;
    import flash.net.URLRequest;
    
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.core.Options;
    import org.bigbluebutton.core.model.VideoProfile;
    import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
    
    public class VideoProfileManager extends EventDispatcher {
		private static const LOGGER:ILogger = getClassLogger(VideoProfileManager);      

        public static const DEFAULT_FALLBACK_LOCALE:String = "en_US";
        private var _profiles:Array = new Array();
                
        public function loadProfiles():void {
			var options : VideoConfOptions = Options.getOptions(VideoConfOptions) as VideoConfOptions;
			
            var urlLoader:URLLoader = new URLLoader();
            urlLoader.addEventListener(Event.COMPLETE, handleComplete);
            var date:Date = new Date();
            var localeReqURL:String = options.videoProfilesConfig + "?a=" + date.time;
            LOGGER.debug("VideoProfileManager::loadProfiles [{0}]", [localeReqURL]);
            urlLoader.load(new URLRequest(localeReqURL));
        }       
        
        private function handleComplete(e:Event):void{
            LOGGER.debug("VideoProfileManager::handleComplete [{0}]", [new XML(e.target.data)]);
      
            // first clear the array
            _profiles.splice(0);

            var profiles:XML = new XML(e.target.data);
            var fallbackLocale:String = profiles.@fallbackLocale != undefined ? profiles.@fallbackLocale.toString(): DEFAULT_FALLBACK_LOCALE;
            for each (var profile:XML in profiles.children()) {
                _profiles.push(new VideoProfile(profile, fallbackLocale));
            }
        }
        
        public function get profiles():Array {
            if (_profiles.length > 0) {
                return _profiles;
            } else {
                return [ fallbackVideoProfile ];
            }
        }

        public function getVideoProfileById(id:String):VideoProfile {
            for each (var profile:VideoProfile in _profiles) {
                if (profile.id == id) {
                    return profile;
                }
            }
            return null;
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
                return null;
            }
        }

        public function get fallbackVideoProfile():VideoProfile {
            return new VideoProfile(
                <profile id="4L7344ZoBYGTocbHOIvzXsrGiBGoohFv" default="true">
                    <locale>
                        <en_US>Fallback profile</en_US>
                    </locale>
                    <width>320</width>
                    <height>240</height>
                    <keyFrameInterval>5</keyFrameInterval>
                    <modeFps>10</modeFps>
                    <qualityBandwidth>0</qualityBandwidth>
                    <qualityPicture>90</qualityPicture>
                    <enableH264>true</enableH264>
                    <h264Level>2.1</h264Level>
                    <h264Profile>main</h264Profile>
                </profile>
                , DEFAULT_FALLBACK_LOCALE);
        }
    }
}