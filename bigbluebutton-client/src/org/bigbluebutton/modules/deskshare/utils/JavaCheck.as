/**
 * WebMeeting open source conferencing system - http://www.speakserve.org/
 * 
 * Copyright (c) 2013 SpeakServe Ltd. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * WebMeeting is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with WebMeeting; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.deskshare.utils
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.external.ExternalInterface;
	import flash.utils.setTimeout;
	
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.main.events.ClientStatusEvent;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class JavaCheck {		
		public static function checkJava():String {
			var dispatcher : Dispatcher = new Dispatcher();
			var java_version:String = "1.7.0_51";
			
			var xml:XML = BBB.initConfigManager().config.browserVersions;
			if (xml.@java != undefined) {
				java_version = xml.@java.toString();
			}
			
			try {
				var javas : Array = JavaCheck.getJREs();
			} catch ( e : Error ) {
				dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, ResourceUtil.getInstance().getString("bbb.clientstatus.java.title"), ResourceUtil.getInstance().getString("bbb.clientstatus.java.notdetected")));
				return ResourceUtil.getInstance().getString("bbb.clientstatus.java.notdetected");
			}
			
			if (javas.length == 0) {
				dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, ResourceUtil.getInstance().getString("bbb.clientstatus.java.title"), ResourceUtil.getInstance().getString("bbb.clientstatus.java.notinstalled")));
				return ResourceUtil.getInstance().getString("bbb.clientstatus.java.notinstalled");
			}
			
			var highestJava : String = javas[0];
			for each (var java : String in javas) {
				var highest : Array = highestJava.split(".");
				var iter : Array = java.split(".");
				
				if (Number(iter[0]) > Number(highest[0])) {
					highestJava = java;
				} else if (Number(iter[0]) == Number(highest[0]) && Number(iter[1]) > Number(highest[1])) {
					highestJava = java;
				} else if (Number(iter[0]) == Number(highest[0]) && Number(iter[1]) == Number(highest[1])) {
					var iterMinor : Number = Number((iter[2] as String).split("_")[1]);
					var highestMinor : Number = Number((highest[2] as String).split("_")[1]);
					if (iterMinor > highestMinor)
					{
						highestJava = java;
					}
				}
			}
			
			var passedJava : Boolean = true;
			var required : Array = java_version.split(".");
			highest = highestJava.split(".");
			if (Number(required[0]) > Number(highest[0])) {
				passedJava = false;
			} else if (Number(required[0]) == Number(highest[0]) && Number(required[1]) > Number(highest[1])) {
				passedJava = false;
			} else if (Number(required[0]) == Number(highest[0]) && Number(required[1]) == Number(highest[1])) {
				var requiredMinor : Number = Number((required[2] as String).split("_")[1]);
				var highestJavaMinor : Number = Number((highest[2] as String).split("_")[1]);
				if (requiredMinor > highestJavaMinor)
				{
					passedJava = false;
				}
			}
			
			if (!passedJava) {
				dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, ResourceUtil.getInstance().getString("bbb.clientstatus.java.title"), ResourceUtil.getInstance().getString("bbb.clientstatus.java.oldversion")));
				return ResourceUtil.getInstance().getString("bbb.clientstatus.java.oldversion");
			} else {
				// Java success
				return null;
			}
		}
		
		private static function getJREs():Array{
			var installedJREs:Array = ExternalInterface.call("deployJava.getJREs");
			
			if (installedJREs == null) throw new Error("Javascript files not found.");
			
			return installedJREs;
		}
	}
}