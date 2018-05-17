/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.main.model.users {
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.core.model.BreakoutUser;
  
  [Bindable]
  public class BreakoutRoom {
    public static const NONE:String = "none";
    
    public static const SELF:String = "self";
    
    public static const OTHER:String = "other";
    
    public var externalMeetingId:String;
    
    public var meetingId:String;
    
    public var sequence:int;
    
    public var name:String;
    
    public var users:ArrayCollection;
    
	public var freeJoin : Boolean;
	
    public var invitedRecently : Boolean;
    
    // Can be one of three following values self, none, other
    public var listenStatus:String = NONE;
    
    public function BreakoutRoom() {
      users = new ArrayCollection();
    }
	
	public function initUsers(): void {
      users = new ArrayCollection();
	}
    
    public function get numberOfUsers():int {
      return users.length;
    }
    
    public function addUser(user: BreakoutUser): void {
      removeUser(user.id);
      users.addItem(user);
    }
	
	public function hasUserWithId(userId:String) : Boolean {
		for (var i : int = 0; i < users.length; i++) {
			if (BreakoutUser(users.getItemAt(i)).id.indexOf(userId) > -1 ) {
				return true;
			}
		}
		return false;
	}
    
    public function removeUser(id: String): void {
      for (var i: int = 0; i < users.length; i++) {
        var user: BreakoutUser = users[i] as BreakoutUser;
        if (user.id == id) {
          users.removeItemAt(i);
          users.refresh();
          return;
        }
      }
    }
  }
}
