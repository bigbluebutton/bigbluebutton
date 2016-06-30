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
	import org.bigbluebutton.modules.deskshare.utils.BrowserCheck;
	
	public class JavaCheck {
    public static function checkJava():String {
      var dispatcher : Dispatcher = new Dispatcher();
      var java_version:String = "1.7.0_51";
      
      var xml:XML = BBB.initConfigManager().config.browserVersions;
      if (xml.@java != undefined) {
        java_version = xml.@java.toString();
      }
      
      var isJavaOk: Object = checkJavaVersion(java_version);
      
      if (isJavaOk.result == "JAVA_OK") {
        // Java success
        return null;        
     
      } else if (isJavaOk.result == "JAVA_NOT_INSTALLED") {
        if (!BrowserCheck.isChrome42OrHigher()) {
          dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, ResourceUtil.getInstance().getString("bbb.clientstatus.java.title"), ResourceUtil.getInstance().getString("bbb.clientstatus.java.notinstalled")));
        }
        return ResourceUtil.getInstance().getString("bbb.clientstatus.java.notinstalled");        
      } else if (isJavaOk.result == "JAVA_OLDER") {
        dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, ResourceUtil.getInstance().getString("bbb.clientstatus.java.title"), ResourceUtil.getInstance().getString("bbb.clientstatus.java.oldversion")));
        return ResourceUtil.getInstance().getString("bbb.clientstatus.java.oldversion");        
      } else {
        dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, ResourceUtil.getInstance().getString("bbb.clientstatus.java.title"), ResourceUtil.getInstance().getString("bbb.clientstatus.java.notdetected")));
        return ResourceUtil.getInstance().getString("bbb.clientstatus.java.notdetected");   
      }     
    }
       
    private static function checkJavaVersion(minVersion: String):Object {
      return ExternalInterface.call("checkJavaVersion", minVersion);
    }
  }
}