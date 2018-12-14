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
package org.bigbluebutton.core.model
{
    import flash.utils.Dictionary;
    import org.bigbluebutton.core.UsersUtil;
    import org.as3commons.logging.api.ILogger;
    import org.as3commons.logging.api.getClassLogger;
    import org.bigbluebutton.util.i18n.ResourceUtil;

    public class VideoProfile
    {
		private static const LOGGER:ILogger = getClassLogger(VideoProfile);

		private var _fallbackLanguage:String;

        private static var _nextId:int = -1;
        private var _id:String;
        private var _default:Boolean = false;
        private var _name:Dictionary = new Dictionary();
        private var _width:int = 320;
        private var _height:int = 240;
        private var _keyFrameInterval:int = 30;
        private var _modeFps:int = 10;
        private var _qualityBandwidth:int = 0;
        private var _qualityPicture:int = 90;
        private var _enableH264:Boolean = true;
        private var _h264Level:String = "2.1";
        private var _h264Profile:String = "main";

        public function VideoProfile(vxml:XML, fallbackLanguage:String)
        {
            _fallbackLanguage = fallbackLanguage;

            if (vxml.@id != undefined) {
                _id = vxml.@id.toString();
            } else {
                _id = String(nextId());
            }
            if (vxml.@default != undefined) {
                _default = (vxml.@default.toString().toUpperCase() == "TRUE") ? true : false;
            }
            if (vxml.locale != undefined) {
                for each (var locale:XML in vxml.locale.children()) {
                    _name[locale.localName()] = locale.toString();
                }
            }
            if (vxml.width != undefined) {
                _width = vxml.width;
            }
            if (vxml.height != undefined) {
                _height = vxml.height;
            }
            if (vxml.keyFrameInterval != undefined) {
                _keyFrameInterval = vxml.keyFrameInterval;
            }
            if (vxml.modeFps != undefined) {
                _modeFps = vxml.modeFps;
            }
            if (vxml.qualityBandwidth != undefined) {
                _qualityBandwidth = vxml.qualityBandwidth;
            }
            if (vxml.qualityPicture != undefined) {
                _qualityPicture = vxml.qualityPicture;
            }
            if (vxml.enableH264 != undefined) {
                _enableH264 = (vxml.enableH264.toString().toUpperCase() == "TRUE") ? true : false;
            }
            if (vxml.h264Level != undefined) {
                _h264Level = vxml.h264Level.toString();
            }
            if (vxml.h264Profile != undefined) {
                _h264Profile = vxml.h264Profile.toString();
            }

            var logData:Object = UsersUtil.initLogData();
            logData.videoProfile = vidProfileInfo();
            logData.tags = ["video"];
            logData.logCode = "loaded_video_profile";
            LOGGER.info(JSON.stringify(logData));
        }

        public function vidProfileInfo():Object {
					var vinf:Object = new Object();
					vinf.id = this.id;
					vinf.defaultProfile = this.defaultProfile;
					vinf.name = this.name;
					vinf.width = this.width;
					vinf.height = this.height;
					vinf.keyFrameInterval = this.keyFrameInterval;
					vinf.modeFps = this.modeFps;
					vinf.qualityBandwidth = this.qualityBandwidth;
					vinf.qualityPicture =  this.qualityPicture;
					vinf.enableH264 = this.enableH264;
					vinf.h264Level = this.h264Level;
					vinf.h264Profile = this.h264Profile;
					
          return vinf;
        }

        private static function nextId():int {
            _nextId++;
            return _nextId;
        }

        public function get id():String {
            return _id;
        }

        public function get defaultProfile():Boolean {
            return _default;
        }

        public function get name():String {
            var locale:String = ResourceUtil.getInstance().getCurrentLanguageCode();
            if (_name.hasOwnProperty(locale)) {
                return _name[locale];
            } else if (_name.hasOwnProperty(_fallbackLanguage)) {
                return _name[_fallbackLanguage];
            } else {
                return "";
            }
        }

        public function get width():int {
            return _width;
        }

        public function get height():int {
            return _height;
        }

        public function get keyFrameInterval():int {
            return _keyFrameInterval;
        }

        public function get modeFps():int {
            return _modeFps;
        }

        public function get qualityBandwidth():int {
            return _qualityBandwidth;
        }

        public function get qualityPicture():int {
            return _qualityPicture;
        }

        public function get enableH264():Boolean {
            return _enableH264;
        }

        public function get h264Level():String {
            return _h264Level;
        }

        public function get h264Profile():String {
            return _h264Profile;
        }
    }
}