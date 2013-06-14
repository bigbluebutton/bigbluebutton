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
package org.bigbluebutton.modules.users.services
{
  import com.asfusion.mate.events.Dispatcher;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.PresenterStatusEvent;
  import org.bigbluebutton.main.events.SwitchedPresenterEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.Conference;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.main.model.users.events.RoleChangeEvent;
  import org.bigbluebutton.modules.present.events.CursorEvent;
  import org.bigbluebutton.modules.present.events.MoveEvent;
  import org.bigbluebutton.modules.present.events.NavigationEvent;
  import org.bigbluebutton.modules.present.events.RemovePresentationEvent;
  import org.bigbluebutton.modules.present.events.UploadEvent;
  import org.bigbluebutton.modules.present.model.PresentationModel;
  
  public class MessageReceiver implements IMessageListener
  {
    private static const LOG:String = "Users::MessageReceiver - ";
       
    private var dispatcher:Dispatcher;
    
    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
      this.dispatcher = new Dispatcher();
    }
    
    public function onMessage(messageName:String, message:Object):void {
      trace(LOG + " received message " + messageName);
      
      switch (messageName) {
        case "getUsersReply":
          handleGetUsersReply(message);
          break;		
        case "assignPresenterCallback":
          handleAssignPresenterCallback(message);
          break;
        case "logout":
          handleLogout(message);
          break;
        case "participantJoined":
          handleParticipantJoined(message);
          break;
        case "participantLeft":
          handleParticipantLeft(message);
          break;
        case "participantStatusChange":
          handleParticipantStatusChange(message);
          break;
      }
    }  
    
    public function handleParticipantLeft(msg:Object):void {
      var user:BBBUser = UserManager.getInstance().getConference().getUser(msg.userID);
      
      trace(LOG + "Notify others that user [" + user.userID + ", " + user.name + "] is leaving!!!!");
      
      // Flag that the user is leaving the meeting so that apps (such as avatar) doesn't hang
      // around when the user already left.
      user.isLeavingFlag = true;
      
      var joinEvent:UserLeftEvent = new UserLeftEvent(UserLeftEvent.LEFT);
      joinEvent.userID = user.userID;
      dispatcher.dispatchEvent(joinEvent);	
      
      UserManager.getInstance().getConference().removeUser(msg.userID);	        
    }
    
    public function handleParticipantJoined(msg:Object):void {
      participantJoined(msg);
    }
    
    /**
     * Called by the server to tell the client that the meeting has ended.
     */
    public function handleLogout(msg:Object):void {     
      var endMeetingEvent:BBBEvent = new BBBEvent(BBBEvent.END_MEETING_EVENT);
      dispatcher.dispatchEvent(endMeetingEvent);
    }
    
    private function handleGetUsersReply(msg:Object):void {
      trace(LOG + "number of users = [" + msg.count + "]");
      if (msg.count > 0) {
        trace(LOG + "number of users = [" + msg.users.length + "]");
        for(var p:Object in msg.users) {
          participantJoined(msg.users[p]);
        }
      }	 
      becomePresenterIfLoneModerator();
    }
    
    private function becomePresenterIfLoneModerator():void {
      trace(LOG + "Checking if I need to become presenter.");
      var participants:Conference = UserManager.getInstance().getConference();
      if (participants.hasOnlyOneModerator()) {
        trace(LOG + "There is only one moderator in the meeting. Is it me? ");
        var user:BBBUser = participants.getTheOnlyModerator();
        if (user.me) {
          trace(LOG + "Setting me as presenter because I'm the only moderator. My userid is [" + user.userID + "]");
          var presenterEvent:RoleChangeEvent = new RoleChangeEvent(RoleChangeEvent.ASSIGN_PRESENTER);
          presenterEvent.userid = user.userID;
          presenterEvent.username = user.name;
          var dispatcher:Dispatcher = new Dispatcher();
          dispatcher.dispatchEvent(presenterEvent);
        } else {
          trace(LOG + "No. It is not me. It is [" + user.userID + ", " + user.name + "]");
        }
      } else {
        trace(LOG + "No. There are more than one moderator.");
      }
    }
    
    public function handleAssignPresenterCallback(msg:Object):void {
      var newPresenterID:String = msg.newPresenterID;
      var newPresenterName:String = msg.newPresenterName;
      var assignedBy:String = msg.assignedBy;
      
      trace(LOG + "**** assignPresenterCallback [" + newPresenterID + "," + newPresenterName + "," + assignedBy + "]");
      
      var meeting:Conference = UserManager.getInstance().getConference();
      
      if (meeting.amIThisUser(newPresenterID)) {
        trace(LOG + "**** Switching [" + newPresenterName + "] to presenter");
        sendSwitchedPresenterEvent(true, newPresenterID);
        
        meeting.amIPresenter = true;				
        var e:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_PRESENTER_MODE);
        e.userID = newPresenterID;
        e.presenterName = newPresenterName;
        e.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(e);	
        
      } else {	
        trace(LOG + "**** Switching [" + newPresenterName + "] to presenter. I am viewer.");
        sendSwitchedPresenterEvent(false, newPresenterID);
        
        meeting.amIPresenter = false;
        var viewerEvent:MadePresenterEvent = new MadePresenterEvent(MadePresenterEvent.SWITCH_TO_VIEWER_MODE);
        viewerEvent.userID = newPresenterID;
        viewerEvent.presenterName = newPresenterName;
        viewerEvent.assignerBy = assignedBy;
        
        dispatcher.dispatchEvent(viewerEvent);
      }
    }
    
    private function sendSwitchedPresenterEvent(amIPresenter:Boolean, newPresenterUserID:String):void {
      
      var roleEvent:SwitchedPresenterEvent = new SwitchedPresenterEvent();
      roleEvent.amIPresenter = amIPresenter;
      roleEvent.newPresenterUserID = newPresenterUserID;
      dispatcher.dispatchEvent(roleEvent);   
    }
    
    public function participantStatusChange(userID:String, status:String, value:Object):void {
      trace(LOG + "Received status change [" + userID + "," + status + "," + value + "]")			
      UserManager.getInstance().getConference().newUserStatus(userID, status, value);
      
      if (status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
    
    public function participantJoined(joinedUser:Object):void { 
      var user:BBBUser = new BBBUser();
      user.userID = joinedUser.userID;
      user.name = joinedUser.name;
      user.role = joinedUser.role;
      user.externUserID = joinedUser.externUserID;
      user.isLeavingFlag = false;
      
      trace(LOG + "User status: hasStream " + joinedUser.hasStream);
      
      trace(LOG + "Joined as [" + user.userID + "," + user.name + "," + user.role + "," + joinedUser.hasStream + "]");
      UserManager.getInstance().getConference().addUser(user);
      participantStatusChange(user.userID, "hasStream", joinedUser.hasStream);
      participantStatusChange(user.userID, "presenter", joinedUser.presenter);
      participantStatusChange(user.userID, "raiseHand", joinedUser.raiseHand);
      
      
      var joinEvent:UserJoinedEvent = new UserJoinedEvent(UserJoinedEvent.JOINED);
      joinEvent.userID = user.userID;
      dispatcher.dispatchEvent(joinEvent);	
      
    }
    
    /**
     * Callback from the server from many of the bellow nc.call methods
     */
    public function handleParticipantStatusChange(msg:Object):void {

      trace(LOG + "Received status change [" + msg.userID + "," + msg.status + "," + msg.value + "]")			
      UserManager.getInstance().getConference().newUserStatus(msg.userID, msg.status, msg.value);
      
      if (msg.status == "presenter"){
        var e:PresenterStatusEvent = new PresenterStatusEvent(PresenterStatusEvent.PRESENTER_NAME_CHANGE);
        e.userID = msg.userID;
        
        dispatcher.dispatchEvent(e);
      }		
    }
  }
}