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
	import org.bigbluebutton.main.model.users.events.ConnectionFailedEvent;
        	
	public class JoinService
	{  
		private var request:URLRequest = new URLRequest();
		private var vars:URLVariables = new URLVariables();
		
		private var urlLoader:URLLoader;
		private var _resultListener:Function;
		
		public function JoinService()
		{
			urlLoader = new URLLoader();
		}
		
		public function load(url:String) : void
		{
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
			var xml:XML = new XML(e.target.data)

			var returncode:String = xml.returncode;
			if (returncode == 'FAILED') {
				LogUtil.debug("Join FAILED = " + xml);
							
				navigateToURL(new URLRequest(xml.logoutURL),'_self')
				
			} else if (returncode == 'SUCCESS') {
				LogUtil.debug("Join SUCESS = " + xml);
        trace("JoinService::handleComplete() Join SUCESS = " + xml);
				var user:Object = {username:xml.fullname, conference:xml.conference, conferenceName:xml.confname, externMeetingID:xml.externMeetingID,
										meetingID:xml.meetingID, externUserID:xml.externUserID, internalUserId:xml.internalUserID,
										role:xml.role, room:xml.room, authToken:xml.room, record:xml.record, 
										webvoiceconf:xml.webvoiceconf, dialnumber:xml.dialnumber,
										voicebridge:xml.voicebridge, mode:xml.mode, welcome:xml.welcome, logoutUrl:xml.logoutUrl, 
                    defaultLayout:xml.defaultLayout, avatarURL:xml.avatarURL};
				user.customdata = new Object();
				if(xml.customdata)
				{
					for each(var cdnode:XML in xml.customdata.elements()){
						LogUtil.debug("checking user customdata: "+cdnode.name() + " = " + cdnode);
						user.customdata[cdnode.name()] = cdnode.toString();
					}
				}
				
				if (_resultListener != null) _resultListener(true, user);
			}
				
		}
		
		public function get loader():URLLoader{
			return this.urlLoader;
		}
	}
}