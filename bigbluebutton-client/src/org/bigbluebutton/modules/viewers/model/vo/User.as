/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.viewers.model.vo
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.modules.viewers.view.events.StreamStartedEvent;
	
	public class User
	{
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
					hasStream = status.value;
					if (hasStream) sendStreamStartedEvent();
					break;
				case "streamName":
					streamName = status.value as String;
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
		/*
		public var me:Boolean = false;
		public var userid:Number;
		public var name:String;
		
		public var role:String = Role.VIEWER;	
		public var room:String = "";
		public var authToken:String = "";
		*/
		/**
		 * This is a workaround until we figure out how to make 
		 * status Bindable in StatusItemRenderer.mxml (ralam 2/20/2009)
		 */
/*		private var _status:Object;
		public var streamName:String = "";
		public var presenter:Boolean = false;
		public var hasStream:Boolean = false;
		
		public function set status(s:Object):void {
			_status = s;
			hasStream = s["hasStream"];
			presenter = s["presenter"];
			streamName = s["streamName"];
		}
	*/
	
		public static function copy(user:User):User {
			var n:User = new User();
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
			dispatcher.dispatchEvent(new StreamStartedEvent(this.name, this.streamName));
		}
	}
}