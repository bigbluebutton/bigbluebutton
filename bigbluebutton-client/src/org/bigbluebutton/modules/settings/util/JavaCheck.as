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
package org.bigbluebutton.modules.settings.util
{
	import flash.external.ExternalInterface;

	public class JavaCheck
	{
		public static function createWebStartLaunchButton(jnlp:String, minimumVersion:String):void{
			var response:Object = ExternalInterface.call("deployJava.createWebStartLaunchButton", jnlp, minimumVersion);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function createWebStartLaunchButtonEx(jnlp:String, minimumVersion:String):void{
			var response:Object = ExternalInterface.call("deployJava.createWebStartLaunchButtonEx", jnlp, minimumVersion);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function getBrowser():String{
			var browser:String = ExternalInterface.call("deployJava.getBrowser");
			
			if (browser == null) throw new Error("Javascript files not found.");
			
			return browser;
		}
		
		public static function getJREs():Array{
			var installedJREs:Array = ExternalInterface.call("deployJava.getJREs");
			
			if (installedJREs == null) throw new Error("Javascript files not found.");
			
			return installedJREs;
		}
		
		public static function installJRE(requestVersion:String):void{
			var response:Object = ExternalInterface.call("deployJava.installJRE", requestVersion);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function installLatestJRE():void{
			var response:Object = ExternalInterface.call("deployJava.installLatestJRE");
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function isPlugin2():Boolean{
			var plugin2:String = ExternalInterface.call("deployJava.isPlugin2");
			
			if (plugin2 == null) throw new Error("Javascript files not found.");
			
			if (plugin2 == "true") return true;
			else return false;
		}
		
		public static function isWebStartInstalled(minimumVersion:String):Boolean{
			var webstartInstalled:String = ExternalInterface.call("deployJava.isWebStartInstalled", minimumVersion);
			
			if (webstartInstalled == null) throw new Error("Javascript files not found.");
			
			if (webstartInstalled == "true") return true;
			else return false;
		}
		
		public static function runApplet(attributes:Object, parameters:Object, minimumVersion:String):void{
			var response:Object = ExternalInterface.call("deployJava.runApplet", attributes, parameters, minimumVersion);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function setAdditionalPackages(packageList:Object):void{
			var response:Object = ExternalInterface.call("deployJava.setAdditionalPackages", packageList);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function setInstallerType(type:String):void{
			var response:Object = ExternalInterface.call("deployJava.setInstallerType", type);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
		
		public static function versionCheck(version:String):String{
			var version:String = ExternalInterface.call("deployJava.versionCheck", version);
			
			if (version == null) throw new Error("Javascript files not found.");
			
			return version;
		}
		
		public static function writeAppletTag(attributes:Object, parameters:Object = null):void{
			var response:Object = ExternalInterface.call("deployJava.writeAppletTag", attributes, parameters);
			
			if (response == null) throw new Error("Javascript files not found.");
		}
	}
}