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
package org.bigbluebutton.main.model.users
{
	import com.asfusion.mate.events.Dispatcher;	
	import flash.events.*;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	import flash.net.navigateToURL;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.model.Me;
	import org.bigbluebutton.core.model.MeBuilder;
	import org.bigbluebutton.core.model.MeetingBuilder;
	import org.bigbluebutton.core.model.MeetingModel;
	import org.bigbluebutton.core.model.users.User;
	import org.bigbluebutton.core.model.users.UsersModel;
	import org.bigbluebutton.main.events.MeetingNotFoundEvent;
	import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
        	
	public class JoinService
	{  
    private static const LOG:String = "Users::JoinService - ";
    
		private var request:URLRequest = new URLRequest();
		private var vars:URLVariables = new URLVariables();
		
		private var urlLoader:URLLoader;
		private var _resultListener:Function;
		
		public function JoinService() {
			urlLoader = new URLLoader();
		}
		
		public function load(url:String):void {
			var date:Date = new Date();
//			url += "?a=" + date.time
			LogUtil.debug("JoinService:load(...) " + url);
      request = new URLRequest(url);
      request.method = URLRequestMethod.GET;		
            
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
      urlLoader.load(request);	
		}

		public function addJoinResultListener(listener:Function):void {
			_resultListener = listener;
		}
		
		private function httpStatusHandler(event:HTTPStatusEvent):void {
			LogUtil.debug("httpStatusHandler: " + event);
		}

		private function ioErrorHandler(event:IOErrorEvent):void {
			trace("ioErrorHandler: " + event);
			var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.USER_LOGGED_OUT);
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(e);
		}
		
		private function handleComplete(e:Event):void {			
      var result:Object = JSON.parse(e.target.data);
      trace(LOG + "Enter response = " + JSON.stringify(result));
            
			var returncode:String = result.response.returncode;
			if (returncode == 'FAILED') {
				trace(LOG + "Join FAILED = " + JSON.stringify(result));						
        var dispatcher:Dispatcher = new Dispatcher();
        dispatcher.dispatchEvent(new MeetingNotFoundEvent(result.response.logoutURL));			
			} else if (returncode == 'SUCCESS') {
				trace("Join SUCESS = " + JSON.stringify(result));
        var user:Object = new Object();
        user.username = result.response.fullname;
        user.conference = result.response.conference; 
        user.conferenceName = result.response.confname;
        user.externMeetingID = result.response.externMeetingID;
        user.meetingID = result.response.meetingID;
        user.externUserID = result.response.externUserID;
        user.internalUserId = result.response.internalUserID;
        user.role = result.response.role;
        user.room = result.response.room;
        user.authToken = result.response.room;
        user.record = result.response.record;
        user.webvoiceconf = result.response.webvoiceconf;
        user.dialnumber = result.response.dialnumber;
        user.voicebridge = result.response.voicebridge;
        user.mode = result.response.mode;
        user.welcome = result.response.welcome;
        user.logoutUrl = result.response.logoutUrl;
        user.defaultLayout = result.response.defaultLayout;
        user.avatarURL = result.response.avatarURL
        
        if (result.response.hasOwnProperty("modOnlyMessage")) {
          user.modOnlyMessage = result.response.modOnlyMessage;
          MeetingModel.getInstance().modOnlyMessage = user.modOnlyMessage;
        }
          
				user.customdata = new Object();
       
				if (result.response.customdata) {
          var cdata:Array = result.response.customdata as Array;
          trace(LOG + "num custom data = " + cdata.length);
          for each (var item:Object in cdata) {
            trace(LOG + item.toString());
            for (var id:String in item) {
              var value:String = item[id] as String;
              trace(id + " = " + value);
              user.customdata[id] = value;
            }                        
          }
				}
				
        UsersModel.getInstance().me = new MeBuilder(user.internalUserId, user.username).withAvatar(user.avatarURL)
                                             .withExternalId(user.externUserID).withToken(user.authToken)
                                             .withLayout(user.defaultLayout).withWelcome(user.welcome)
                                             .withDialNumber(user.dialnumber).withRole(user.role)
                                             .withCustomData(user.customData).build();
                
        MeetingModel.getInstance().meeting = new MeetingBuilder(user.conference, user.conferenceName)
                                             .withLayout(user.defaultLayout).withVoiceConf(user.voiceBridge)
                                             .withExternalId(user.externMeetingID).build();
        
				if (_resultListener != null) _resultListener(true, user);
			}
				
		}
		
		public function get loader():URLLoader{
			return this.urlLoader;
		}
	}
}