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
package org.bigbluebutton.core.vo {
	public class Config {
		private var _version:String;
		private var _localeVersion:String;
		private var _portTestHost:String;
		private var _portTestApplication:String;
		private var _helpURL:String;
		private var _application:String;
		private var _host:String;
		private var _numModules:int;
		private var _languageEnabled:Boolean;
		private var _shortcutKeysShowButton:Boolean;
		private var _skinning:String = "";
		private var _showDebug:Boolean = false;
		
		public function Config(builder:ConfigBuilder) {
			_version = builder.version;
			_localeVersion = builder.localeVersion;
			_portTestHost = builder.portTestHost;
			_portTestApplication = builder.portTestApplication;
			_helpURL = builder.helpURL;
			_application = builder.application;
			_host = builder.host;
			_numModules = builder.numModules;
			_languageEnabled = builder.languageEnabled;
			_shortcutKeysShowButton = builder.shortcutKeysShowButton;
			_skinning = builder.skinning;
			_showDebug = builder.showDebug;
		}
		
		public function get version():String {
			return _version;
		}
		
		public function get localeVersion():String {
			return _localeVersion;
		}
		
		public function get portTestHost():String {
			return _portTestHost;
		}
		
		public function get portTestApplication():String {
			return _portTestApplication;
		}
		
		public function get helpURL():String {
			return _helpURL;
		}
		
		public function get application():String {
			return _application;
		}
		
		public function get host():String {
			return _host;
		}
		
		public function get numModules():int {
			return _numModules;
		}
		
		public function get languageEnabled():Boolean {
			return _languageEnabled;
		}
		
		public function get shortcutKeysShowButton():Boolean {
			return _shortcutKeysShowButton;
		}
		
		public function get skinning():String {
			return _skinning;
		}
		
		public function get showDebug():Boolean {
			return _showDebug;
		} 
	}
}