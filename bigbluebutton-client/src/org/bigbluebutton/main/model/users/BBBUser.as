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
package org.bigbluebutton.main.model.users
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
	
	public class BBBUser {
		public static const MODERATOR:String = "MODERATOR";
		public static const VIEWER:String = "VIEWER";
		public static const PRESENTER:String = "PRESENTER";
		
		[Bindable] public var me:Boolean = false;
		[Bindable] public var userid:Number;
		[Bindable] public var name:String;
		[Bindable] public var hasStream:Boolean = false;
		[Bindable] public var streamName:String = "";
		[Bindable] public var presenter:Boolean = false;
		[Bindable] public var raiseHand:Boolean = false;
		[Bindable] public var role:String = Role.VIEWER;	
		[Bindable] public var room:String = "";
		[Bindable] public var authToken:String = "";
		[Bindable] public var selected:Boolean = false;
		[Bindable] public var voiceUserid:Number;
		[Bindable] public var voiceMuted:Boolean = false;
		[Bindable] public var voiceJoined:Boolean = false;
		[Bindable] public var voiceLocked:Boolean = false;
		
		private var _status:StatusCollection = new StatusCollection();
				
		public function get status():ArrayCollection {
			return _status.getAll();
		}
		
		public function set status(s:ArrayCollection):void {
			_status.status = s;
		}	
			
		public function addStatus(status:Status):void {
			_status.addStatus(status);
		}
		
		public function changeStatus(status:Status):void {
			//_status.changeStatus(status);
			if (status.name == "presenter") {
				presenter = status.value
			}
			switch (status.name) {
				case "presenter":
					presenter = status.value;
					break;
				case "hasStream":
					var streamInfo:Array = String(status.value).split(/,/); 
					/**
					 * Cannot use this statement as new Boolean(expression)
					 * return true if the expression is a non-empty string not
					 * when the string equals "true". See Boolean class def.
					 * 
					 * hasStream = new Boolean(String(streamInfo[0]));
					 */					
					if (String(streamInfo[0]).toUpperCase() == "TRUE") {
						hasStream = true;
					} else {
						hasStream = false;
					}
					
					var streamNameInfo:Array = String(streamInfo[1]).split(/=/);
					streamName = streamNameInfo[1]; 
					if (hasStream) sendStreamStartedEvent();
					break;
				case "raiseHand":
					raiseHand = status.value as Boolean;
					break;
			}
		}
		
		public function removeStatus(name:String):void {
			_status.removeStatus(name);
		}
		
		public function getStatus(name:String):Status {
			return _status.getStatus(name);
		}
	
		public static function copy(user:BBBUser):BBBUser {
			var n:BBBUser = new BBBUser();
			n.authToken = user.authToken;
			n.me = user.me;
			n.userid = user.userid;
			n.name = user.name;
			n.hasStream = user.hasStream;
			n.streamName = user.streamName;
			n.presenter = user.presenter;
			n.raiseHand = user.raiseHand;
			n.role = user.role;	
			n.room = user.room;
			
			return n;		
		}
		
		private function sendStreamStartedEvent():void{
			var dispatcher:Dispatcher = new Dispatcher();
			dispatcher.dispatchEvent(new StreamStartedEvent(userid, name, streamName));
		}
	}
}