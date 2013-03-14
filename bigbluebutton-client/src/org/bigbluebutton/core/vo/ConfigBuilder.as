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
	public class ConfigBuilder {
		internal var version:String;
		internal var localeVersion:String;
		internal var portTestHost:String;
		internal var portTestApplication:String;
		internal var helpURL:String;
		internal var application:String;
		internal var host:String;
		internal var numModules:int;
		internal var languageEnabled:Boolean;
		internal var shortcutKeysShowButton:Boolean;
		internal var skinning:String = "";
		internal var showDebug:Boolean = false;
		
		public function ConfigBuilder(version:String, localVersion:String){
			this.version = version;
			this.localeVersion = localVersion;
		}
		
		public function withPortTestHost(portTestHost:String):ConfigBuilder {
			this.portTestHost = portTestHost;
			return this;
		}
		
		public function withPortTestApplication(portTestApplication:String):ConfigBuilder {
			this.portTestApplication = portTestApplication;
			return this;
		}

		public function withHelpUrl(helpUrl:String):ConfigBuilder {
			this.helpURL = helpUrl;
			return this;
		}
		
		public function withApplication(application:String):ConfigBuilder {
			this.application = application;
			return this;
		}
		
		public function withHost(host:String):ConfigBuilder {
			this.host = host;
			return this;
		}
		
		public function withNumModule(numModules:int):ConfigBuilder {
			this.numModules = numModules;
			return this;
		}
		
		public function withLanguageEnabled(languageEnabled:Boolean):ConfigBuilder {
			this.languageEnabled = languageEnabled;
			return this;
		}
		
		public function withShortcutKeysShowButton(shortcutKeysShowButton:Boolean):ConfigBuilder {
			this.shortcutKeysShowButton = shortcutKeysShowButton;
			return this;
		}
		
		public function withSkinning(skinning:String):ConfigBuilder {
			this.skinning = skinning;
			return this;
		}
		
		public function withShowDebug(showDebug:Boolean):ConfigBuilder {
			this.showDebug = showDebug;
			return this;
		}
		
   		public function build():Config {
			return new Config(this);
		}		
	}
}