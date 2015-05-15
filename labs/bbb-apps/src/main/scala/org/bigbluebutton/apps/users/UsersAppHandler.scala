package org.bigbluebutton.apps.users

import akka.actor.{ActorRef, actorRef2Scala}
import akka.event.LoggingAdapter
import org.bigbluebutton.apps.Role
import org.bigbluebutton.apps.RunningMeetingActor
import org.bigbluebutton.apps.protocol.StatusCodes
import org.bigbluebutton.apps.protocol.ErrorCodes
import org.bigbluebutton.apps.users._
import org.bigbluebutton.apps.users.messages._
import org.bigbluebutton.apps.users.data._


/**
 * Users app for meeting
 */
trait UsersAppHandler {  
  this : RunningMeetingActor =>
  
  val pubsub: ActorRef
  val log: LoggingAdapter
  val usersApp = UsersApp()
  
  /**
   * Handle a register user request from 3rd-party.
   */
  def handleRegisterUser(msg: RegisterUserRequest) = {
    val user = usersApp.register(msg.user)
    val response = Result(true, "User has been registered.")
    sender ! RegisterUserResponse(msg.session, response,
                                  user.token, msg.user)
  }
  
  /**
   * Handle an assign presenter request from client.
   */
  def handleAssignPresenter(msg: AssignPresenter) = {
    usersApp.getJoinedUser(msg.presenter.presenter.id) match {
      case Some(e) => {
        
        // Make all users viewer and tell the clients to switch to
        // viewer mode.
        usersApp.makeAllUsersViewer()
        pubsub ! BecomeViewer(msg.session)
        
        // Make the user presenter and tell the clients that a user
        // has become presenter. The new presenter's client should
        // switch to presenter more while others stay as viewer mode.
        usersApp.makePresenter(e)
        pubsub ! BecomePresenter(msg.session, msg.presenter)
      }
      
      case None => log.info("Making an unknown user presenter.")
    }
  }
  
  /**
   * Handle a user join request from 3rd-party.
   */
  def handleUserJoinRequest(msg: UserJoinRequest) = {
    val token = msg.token
    usersApp.join(token) match {
      case Some(juser) => {
        
        val response = Result(true, "Successfully joined the user.")
        val jur = UserJoinResponse(msg.session, response, Some(juser))
        sender ! jur
        
        // Broadcast that a user has joined.
        pubsub ! UserJoined(msg.session, token, juser)      
        
        if (! usersApp.hasPresenter && juser.user.role == Role.MODERATOR) {
          val moderator = usersApp.findAModerator
          moderator foreach { m => 
            usersApp.makePresenter(m)
            val presenter = UserIdAndName(m.id, m.user.name)
            val assignedBy = SystemUser
            val newPresenter = Presenter(presenter, assignedBy)
            pubsub ! BecomePresenter(msg.session, newPresenter)
          }
        }
      }
      case None => {
        val response = Result(false, "Invalid token.")
        val jur = UserJoinResponse(msg.session, response, None)
        sender ! jur        
      }
    }
  }
  
  /**
   * Handle user leaving message.
   */
  def handleUserLeave(msg: UserLeave) = {
    val user = usersApp.left(msg.userId) 
    user foreach { u => pubsub ! UserLeft(msg.session, u) }        
  }
  
  /** 
   *  Handle get users request message.
   */
  def handleGetUsersRequest(gur: GetUsersRequest) = {
    pubsub ! GetUsersResponse(gur.session, gur.requesterId, usersApp.joined)
  }
  
  /**
   * Handle user raise hand request.
   */
  def handleRaiseHand(msg: RaiseHand) = {
    val user = usersApp.raiseHand(msg.user.id, true)
    pubsub ! HandRaised(session, msg.user)
  }
  
  /**
   * Handle user lower hand request.
   */
  def handleLowerHand(msg: LowerHand) = {
    val user = usersApp.raiseHand(msg.user.id, false)
    pubsub ! HandLowered(session, msg.user, msg.loweredBy)
  }
  
  /**
   * Handle user joining voice conf message.
   */
  def handleVoiceUserJoin(msg: VoiceUserJoin) = {
    val vid = VoiceIdentity(callerId = msg.callerId, muted = msg.muted, 
                            locked = msg.locked, talking = msg.talking,
                            metadata = msg.metadata)
                            
    val joinedUser = usersApp.joinVoiceUser(msg.userId, vid, meeting)
    
    // Send a UserJoined message just like the user joined through the
    // web because the user might have just called in from the phone.
    pubsub ! UserJoined(session, joinedUser.token, joinedUser)
  }
  
  def handleMuteUser(msg: MuteUser) = {
    val user = usersApp.getJoinedUser(msg.user.id)
    user foreach { u =>
      // Tell the voice conference to mute the user.
      pubsub ! UserMuteRequest(session, msg.user, msg.mute, u.voiceIdentity.metadata)  
      
      // Tell interested parties that the user is being muted.
      pubsub ! MuteUserRequest(session, msg.user, msg.mute, msg.mutedBy)
    }
  }
  
  def handleUserMuted(msg: UserMuted) = {
    val user = usersApp.userMuted(msg.userId, msg.muted)
    user foreach { u =>
      pubsub ! UserHasBeenMuted(session, UserIdAndName(u.id, u.user.name), msg.muted)
    }
  }
}