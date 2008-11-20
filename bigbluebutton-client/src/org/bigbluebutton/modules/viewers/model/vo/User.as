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
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.Role;
		
	public class User
	{
		[Bindable] public var me:Boolean = false;
		[Bindable] public var userid:Number;
		[Bindable] public var name:String;
		[Bindable] public var hasStream:Boolean = false;
		[Bindable] public var streamName:String = "";
		[Bindable] public var presenter:Boolean = false;
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
			_status.changeStatus(status);
		}
		
		public function removeStatus(name:String):void {
			_status.removeStatus(name);
		}
		
		public function getStatus(name:String):Status {
			return _status.getStatus(name);
		}
	}
}