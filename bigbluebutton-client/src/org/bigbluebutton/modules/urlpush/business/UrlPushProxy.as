/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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
package org.bigbluebutton.modules.urlpush.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.NetStatusEvent;
	import flash.net.NetConnection;
	import flash.net.SharedObject;
	
	import mx.controls.Alert;
	
	import com.asfusion.mate.events.Dispatcher;
	import org.bigbluebutton.modules.urlpush.events.UrlPushModuleEvent;
	import org.bigbluebutton.modules.urlpush.events.UrlPushEvent;
	
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;

	public class UrlPushProxy
	{
		private var url:String;
		private var conference:String;
		private var room:String;
		private var userid:Number;
		private var connection:NetConnection;
		
		private var urlPushSO:SharedObject;

		
		public function connect(e:UrlPushModuleEvent):void{
			extractAttributes(e.data);
			
			urlPushSO = SharedObject.getRemote("urlPushSO", url, false);
			urlPushSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusEventHandler);
			urlPushSO.client = this;
			urlPushSO.connect(connection);
		}
		
		private function extractAttributes(a:Object):void{
			conference = a.conference as String;
			room = a.room as String;
			userid = a.userid as Number;
			connection = a.connection;
			url = connection.uri;
		}
		
		private function netStatusEventHandler(event:NetStatusEvent):void{
			Alert.show(event.info.status);
		}
		
		public function urlPush(e:UrlPushEvent):void{
			urlPushSO.send("gotoUrl", e.url);
		}
		
		public function gotoUrl(url:String):void{
			navigateToURL(new URLRequest(url), "_blank");			
		}
	}
}