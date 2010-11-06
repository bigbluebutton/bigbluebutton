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
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;

	public class Conference
	{		
		private var _myUserid : Number;
		
		[Bindable] public var me:BBBUser = null;		
		[Bindable] public var users:ArrayCollection = null;			
				
		public function Conference() : void
		{
			me = new BBBUser();
			users = new ArrayCollection();
		}

		/**
		 * Adds a user to this conference 
		 * @param newuser
		 * 
		 */		
		public function addUser(newuser:BBBUser) : void
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
		
		public function hasOnlyOneModerator():Boolean {
			var p:BBBUser;
			var moderatorCount:int = 0;
			
			for (var i:int = 0; i < users.length; i++)
			{
				p = users.getItemAt(i) as BBBUser;				
				if (p.role == Role.MODERATOR) {
					moderatorCount++;
				}
			}				
			
			if (moderatorCount == 1) return true;
			return false;			
		}
		
		public function getTheOnlyModerator():BBBUser {
			var p:BBBUser;
			for (var i:int = 0; i < users.length; i++)
			{
				p = users.getItemAt(i) as BBBUser;				
				if (p.role == Role.MODERATOR) {
					return BBBUser.copy(p);
				}
			}		
			
			return null;	
		}
		
		/**
		 * Get the user with the specific id 
		 * @param id
		 * @return 
		 * 
		 */		
		public function getParticipant(userid:Number) : BBBUser
		{
			var p:Object = getParticipantIndex(userid);
			if (p != null) {
				return p.participant as BBBUser;
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
			var aUser : BBBUser;
			
			for (var i:int = 0; i < users.length; i++)
			{
				aUser = users.getItemAt(i) as BBBUser;
				
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
			var aUser:BBBUser = getParticipant(id);
			
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