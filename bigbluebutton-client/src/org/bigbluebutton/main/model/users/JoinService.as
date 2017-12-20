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
  
  import flash.events.Event;
  import flash.events.HTTPStatusEvent;
  import flash.events.IOErrorEvent;
  import flash.net.URLLoader;
  import flash.net.URLRequest;
  import flash.net.URLRequestMethod;
  import flash.net.URLVariables;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.events.MeetingNotFoundEvent;
  import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
  import org.bigbluebutton.util.QueryStringParameters;
  
  public class JoinService
  {  
    private static const LOGGER:ILogger = getClassLogger(JoinService);      
    
    private var request:URLRequest = new URLRequest();
    private var reqVars:URLVariables = new URLVariables();
    
    private var urlLoader:URLLoader;
    private var _resultListener:Function;
    
    public function JoinService() {
      urlLoader = new URLLoader();
    }
    
    public function load(url:String):void {
      var p:QueryStringParameters = new QueryStringParameters();
      p.collectParameters();
      var sessionToken:String = p.getParameter("sessionToken");
      
      reqVars.sessionToken = sessionToken;
      
      var date:Date = new Date();
      request = new URLRequest(url);
      request.method = URLRequestMethod.GET;
      request.data = reqVars;
      
      urlLoader.addEventListener(Event.COMPLETE, handleComplete);
      urlLoader.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
      urlLoader.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
      urlLoader.load(request);	
    }
    
    public function addJoinResultListener(listener:Function):void {
      _resultListener = listener;
    }
    
    private function httpStatusHandler(event:HTTPStatusEvent):void {
      LOGGER.debug("httpStatusHandler: {0}", [event]);
    }
    
    private function ioErrorHandler(event:IOErrorEvent):void {
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["initialization"];
      logData.message = "IOError calling ENTER api."; 
      LOGGER.error(JSON.stringify(logData));
      
      var e:ConnectionFailedEvent = new ConnectionFailedEvent(ConnectionFailedEvent.USER_LOGGED_OUT);
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(e);
    }
    
    private function processLogoutUrl(confInfo:Object):String {
      var logoutUrl:String = confInfo.logoutUrl;
      var rules:Object = {
        "%%FULLNAME%%": confInfo.username,
          "%%CONFNAME%%": confInfo.conferenceName,
          "%%DIALNUM%%": confInfo.dialnumber,
          "%%CONFNUM%%": confInfo.voicebridge
      }
      
      for (var attr:String in rules) {
        logoutUrl = logoutUrl.replace(new RegExp(attr, "g"), rules[attr]);
      }
      
      return logoutUrl;
    }
    
    private function extractMetadata(metadata:Object):Object {
      var response:Object = new Object();
      if (metadata) {
        var data:Array = metadata as Array;
        for each (var item:Object in data) {
          for (var id:String in item) {
            var value:String = item[id] as String;
            response[id] = value;
          }
        }
      }
      return response;
    }
    
    private function handleComplete(e:Event):void {			
      var result:Object = JSON.parse(e.target.data);
      
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["initialization"];
      
      
      var returncode:String = result.response.returncode;
      if (returncode == 'FAILED') {
        logData.message = "Calling ENTER api failed."; 
        LOGGER.info(JSON.stringify(logData));
        
        var dispatcher:Dispatcher = new Dispatcher();
        dispatcher.dispatchEvent(new MeetingNotFoundEvent(result.response.logoutURL));			
      } else if (returncode == 'SUCCESS') {
        logData.message = "Calling ENTER api succeeded."; 
        LOGGER.info(JSON.stringify(logData));
        
        var apiResponse:EnterApiResponse = new EnterApiResponse();
        apiResponse.meetingName = result.response.confname;
        apiResponse.extMeetingId = result.response.externMeetingID;
        apiResponse.intMeetingId = result.response.meetingID;
        apiResponse.isBreakout = result.response.isBreakout;
        
        apiResponse.username = result.response.fullname;
        apiResponse.extUserId = result.response.externUserID;
        apiResponse.intUserId = result.response.internalUserID;
        apiResponse.role = result.response.role;
        apiResponse.guest = result.response.guest;
        apiResponse.authed = result.response.authed;
        apiResponse.authToken = result.response.authToken;
        
        apiResponse.record = (result.response.record.toUpperCase() == "TRUE");
        apiResponse.allowStartStopRecording = result.response.allowStartStopRecording;
        apiResponse.webcamsOnlyForModerator = result.response.webcamsOnlyForModerator;
        

        apiResponse.dialnumber = result.response.dialnumber;
        apiResponse.voiceConf = result.response.voicebridge;

        apiResponse.welcome = result.response.welcome;
        apiResponse.logoutUrl = processLogoutUrl(result.response);
        apiResponse.logoutTimer = result.response.logoutTimer;
        apiResponse.defaultLayout = result.response.defaultLayout;
        apiResponse.avatarURL = result.response.avatarURL;
        
        apiResponse.customdata = new Object();
        
        if (result.response.customdata) {
          var cdata:Array = result.response.customdata as Array;
          for each (var item:Object in cdata) {
            for (var id:String in item) {
              var value:String = item[id] as String;
              apiResponse.customdata[id] = value;
            }
          }
        }
        
        apiResponse.metadata = extractMetadata(result.response.metadata);
        
        if (result.response.hasOwnProperty("modOnlyMessage")) {
          apiResponse.modOnlyMessage = result.response.modOnlyMessage;
        }
				
				apiResponse.customLogo = result.response.customLogoURL;
        apiResponse.customCopyright = result.response.customCopyright;
				
        if (_resultListener != null) _resultListener(true, apiResponse);
      }
      
    }
    
    public function get loader():URLLoader{
      return this.urlLoader;
    }
  }
}