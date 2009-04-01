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
package org.bigbluebutton.modules.viewers.model.business
{
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.viewers.model.vo.Status;
	import org.bigbluebutton.modules.viewers.model.vo.User;
	

	public class Conference implements IViewers
	{		
		private var _myUserid : Number;
		
		[Bindable] public var me:User = null;		
		[Bindable] public var users:ArrayCollection = null;				
				
		public function Conference() : void
		{
			me = new User();
			users = new ArrayCollection();
		}

		/**
		 * Adds a user to this conference 
		 * @param newuser
		 * 
		 */		
		public function addUser(newuser:User) : void
		{				
			if (! hasParticipant(newuser.userid)) {
				
				if (newuser.userid == me.userid) {
					newuser.me = true;
				}						
				
				users.addItem(newuser);
				sort();
			}					
		}

		/**
		 * Check if the user with the specified id exists 
		 * @param id
		 * @return 
		 * 
		 */		
		public function hasParticipant(userid:Number) : Boolean
		{
			var p:Object = getParticipantIndex(userid);
			if (p != null) {
				return true;
			}
						
			return false;		
		}
		
		/**
		 * Get the user with the specific id 
		 * @param id
		 * @return 
		 * 
		 */		
		public function getParticipant(userid:Number) : User
		{
			var p:Object = getParticipantIndex(userid);
			if (p != null) {
				return p.participant as User;
			}
						
			return null;				
		}
		
		/**
		 * Remove participant with the specified id number 
		 * @param userid
		 * 
		 */		
		public function removeParticipant(userid:Number) : void
		{
			var p:Object = getParticipantIndex(userid);
			if (p != null) {
				LogUtil.debug("removing user[" + p.participant.name + "," + p.participant.userid + "]");				
				users.removeItemAt(p.index);
				sort();
			}							
		}
		
		/**
		 * Get the index number of the participant with the specific userid 
		 * @param userid
		 * @return -1 if participant not found
		 * 
		 */		
		private function getParticipantIndex(userid:Number):Object
		{
			var aUser : User;
			
			for (var i:int = 0; i < users.length; i++)
			{
				aUser = users.getItemAt(i) as User;
				
				if (aUser.userid == userid) {
					return {index:i, participant:aUser};
				}
			}				
			
			// Participant not found.
			return null;
		}

		/**
		 * Removes all the participants from the conference 
		 * 
		 */		
		public function removeAllParticipants() : void
		{
			users.removeAll();
		}		
	
		public function newUserStatus(id:Number, status:String, value:Object):void
		{
			var aUser:User = getParticipant(id);
			
			if (aUser != null) {
				var s:Status = new Status(status, value);
				aUser.changeStatus(s);
			}	
			
			sort();		
		}
		
		/**
		 * Sorts the users by name 
		 * 
		 */		
		private function sort():void
		{
			users.source.sortOn("name", Array.CASEINSENSITIVE);	
			users.refresh();				
		}				
	}
}