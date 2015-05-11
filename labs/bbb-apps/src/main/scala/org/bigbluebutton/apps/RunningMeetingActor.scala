package org.bigbluebutton.apps

import akka.actor.Actor
import akka.actor.ActorRef
import akka.actor.ActorLogging
import akka.actor.Props
import org.bigbluebutton.apps.users.UsersApp
import org.bigbluebutton.apps.protocol.CreateMeetingRequestReply
import org.bigbluebutton.apps.users.UsersAppHandler
import org.bigbluebutton.apps.users._
import org.bigbluebutton.apps.users.messages._
import org.bigbluebutton.apps.chat.ChatAppHandler
import org.bigbluebutton.apps.chat.messages._
import org.bigbluebutton.apps.layout.messages._
import org.bigbluebutton.apps.layout.LayoutAppHandler
import org.bigbluebutton.apps.presentation.messages._
import org.bigbluebutton.apps.presentation.PresentationAppHandler
import org.bigbluebutton.apps.whiteboard.messages._
import org.bigbluebutton.apps.whiteboard.WhiteboardAppHandler

object RunningMeetingActor {
	def props(pubsub: ActorRef, session: Session, 
	          meeting: MeetingDescriptor): Props = 
	      Props(classOf[RunningMeetingActor], pubsub, session, meeting)
}

class RunningMeetingActor (val pubsub: ActorRef, val session: Session, 
                    val meeting: MeetingDescriptor) extends Actor with ActorLogging
                    with UsersAppHandler with ChatAppHandler 
                    with LayoutAppHandler with PresentationAppHandler 
                    with WhiteboardAppHandler {
  
  def receive = {    
    /** Users **/
    case msg: RegisterUserRequest          => handleRegisterUser(msg)
    case msg: UserJoinRequest              => handleUserJoinRequest(msg)
    case msg: UserLeave                    => handleUserLeave(msg)
    case msg: GetUsersRequest              => handleGetUsersRequest(msg)
    case msg: AssignPresenter              => handleAssignPresenter(msg)
    case msg: RaiseHand                    => handleRaiseHand(msg)
    case msg: LowerHand                    => handleLowerHand(msg)
    case msg: VoiceUserJoin                => handleVoiceUserJoin(msg)
    case msg: MuteUser                     => handleMuteUser(msg)
    case msg: UserMuted                    => handleUserMuted(msg)
    
    /** Chat **/
    case msg: NewPrivateChatMessage        => handlePrivateChatMessage(msg) 
    case msg: NewPublicChatMessage         => handlePublicChatMessage(msg)
    case msg: GetPublicChatHistory         => handleGetPublicChatHistory(msg)
    
    /** Layout **/
    case msg: NewLayout                    => handleNewLayout(msg)
    case msg: GetCurrentLayoutRequest      => handleGetCurrentLayoutRequest(msg)
    case msg: SetLayoutRequest             => handleSetLayoutRequest(msg)
    case msg: LockLayoutRequest            => handleLockLayoutRequest(msg)
    
    /** Presentation **/
    case msg: ClearPresentation            => handleClearPresentation(msg)
    case msg: RemovePresentation           => handleRemovePresentation(msg)
    case msg: SendCursorUpdate             => handleSendCursorUpdate(msg)
    case msg: ResizeAndMovePage            => handleResizeAndMoveSlide(msg)
    case msg: DisplayPage                  => handleDisplayPage(msg)
    case msg: SharePresentation            => handleSharePresentation(msg)
    case msg: PreuploadedPresentations     => handlePreuploadedPresentations(msg)
    case msg: PresentationConverted        => handlePresentationConverted(msg)
    
    /** Whiteboard **/
    case msg: NewWhiteboardShape           => handleNewWhiteboardShape(msg)
    case msg: UpdateWhiteboardShape        => handleUpdateWhiteboardShape(msg)
    case msg: DeleteWhiteboardShape        => handleDeleteWhiteboardShape(msg)
    case msg: GetWhiteboardShapes          => handleGetWhiteboardShapes(msg)
    case msg: ClearWhiteboardShapes        => handleClearWhiteboardShapes(msg)
    case msg: DeleteWhiteboard             => handleDeleteWhiteboard(msg)
    case msg: GetWhiteboardOptions         => handleGetWhiteboardOptions(msg)
    
    
    case unknown                  => log.error("Unhandled message: [{}", unknown)
  }
 

}