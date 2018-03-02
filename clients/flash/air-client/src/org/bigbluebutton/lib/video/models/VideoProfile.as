package org.bigbluebutton.lib.video.models {
	import flash.utils.Dictionary;
	
	import mx.resources.ResourceManager;
	
	public class VideoProfile {
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
		
		private var _aspectRatio:Number = -1;
		
		public function VideoProfile(vxml:XML, fallbackLanguage:String) {
			_fallbackLanguage = fallbackLanguage;
			if (vxml.@id != undefined) {
				_id = vxml.@id.toString();
			} else {
				_id = String(nextId());
			}
			if (vxml.@default != undefined) {
				_default = ((vxml.@default).toString().toUpperCase() == "TRUE") ? true : false;
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
			
			// calculate the aspect ratio once
			_aspectRatio = width / height;
			
			trace("This is a new video profile");
			trace(this.toString());
		}
		
		public function toString():String {
			return "VideoProfile [ " + "id: " + this.id + ", " + "default: " + this.defaultProfile + ", " + "name: " + this.name + ", " + "width: " + this.width + ", " + "height: " + this.height + ", " + "keyFrameInterval: " + this.keyFrameInterval + ", " + "modeFps: " + this.modeFps + ", " + "qualityBandwidth: " + this.qualityBandwidth + ", " + "qualityPicture: " + this.qualityPicture + ", " + "enableH264: " + this.enableH264 + ", " + "h264Level: " + this.h264Level + ", " + "h264Profile: " + this.h264Profile + " ]";
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
			var locale:String = ResourceManager.getInstance().localeChain[0]; //"en_US";//ResourceUtil.getInstance().getCurrentLanguageCode();
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
		
		public function set width(value:int):void {
			_width = value;
		}
		
		public function set height(value:int):void {
			_height = value;
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
		
		public function get aspectRatio():Number {
			return _aspectRatio;
		}
	}
}
