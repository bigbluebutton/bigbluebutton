package org.bigbluebutton.apps

import akka.actor.{Actor, ActorRef, ActorLogging, Props}
import org.bigbluebutton.apps._
import org.bigbluebutton.apps.users.messages._

object MeetingManager {
  	def props(pubsub: ActorRef): Props =  Props(classOf[MeetingManager], pubsub)
}

class MeetingManager private (val pubsub: ActorRef) extends Actor with ActorLogging {
  /**
   * Holds our currently running meetings.
   */
  private var meetings = new collection.immutable.HashMap[String, RunningMeeting]
  
  def receive = {
    case createMeetingRequest: CreateMeeting => 
           handleCreateMeetingRequest(createMeetingRequest)
    case msg:RegisterUserRequest => handleRegisterUserRequest(msg)
    
    case meetingMessage: MeetingMessage => handleMeetingMessage(meetingMessage)
    
//    case registerUser : RegisterUserRequest =>
//                                handleRegisterUser(registerUser)
    case "test" => {sender ! "test"; pubsub ! "test"}
    case _ => None
  }
  
  /**
   * Returns true if a meeting with the passed id exist.
   */
  def meetingExist(internalMeetingId: String): Boolean = {
      (meetings.keys find {k => k.startsWith(internalMeetingId)}) != None
  }
  
  /**
   * Creates an internal id out of the external id. 
   */
  def getValidSession(internalId: String): String = { 
    internalId + "-" + System.currentTimeMillis()
  }
  
  def createMeeting(config: MeetingDescriptor, internalId: String):RunningMeeting = {  
	val sessionId = getValidSession(internalId)
	val session = createSession(config.name, config.id, sessionId)
	val runningMeeting = RunningMeeting(session, pubsub, config)	      
	storeMeeting(session.id, runningMeeting)
    runningMeeting
  }
  
  def storeMeeting(session: String, meeting: RunningMeeting) = {
    meetings += (session -> meeting) 
  }
  
  def getSessionFor(internalId: String):Option[String] = {
	 meetings.keys find {key => key.startsWith(internalId)}
  }
  
  def getMeeting(internalId: String):Option[RunningMeeting] = {
    for {
      session <- getSessionFor(internalId)
      meeting <- meetings.get(session)
    } yield meeting
  }
  
  def createSession(name: String, externalId: String, sessionId: String):Session = {   
	 Session(sessionId, MeetingIdAndName(externalId, name))    
  }
  
  def getMeetingUsingSessionId(sessionId: String):Option[RunningMeeting] = {
    for { meeting <- meetings.get(sessionId) } yield meeting    
  }
    
  def handleRegisterUserRequest(msg: RegisterUserRequest) = {
    val internalId = Util.toInternalMeetingId(msg.session.meeting.id)
    val meeting = for {
      meeting <- getMeeting(internalId)
    } yield meeting
    
    meeting.map {m => m.actorRef forward msg}
  }
  
  def handleMeetingMessage(msg: MeetingMessage) = {
    val meeting = for {
      meeting <- getMeetingUsingSessionId(msg.session.id)
    } yield meeting
    
    meeting.map {m => m.actorRef forward msg}    
  }
  
  /**
   * Handle the CreateMeetingRequest message.
   */
  def handleCreateMeetingRequest(msg: CreateMeeting) = {
    val descriptor = msg.descriptor
    val meetingId = descriptor.id
    val name = descriptor.name
    
    log.debug("Received create meeting request for [{}] : [{}]", meetingId, name)
    
    val internalId = Util.toInternalMeetingId(meetingId)
    
    getMeeting(internalId) match {
      case Some(runningMeeting) => {
	      log.info("Meeting [{}] : [{}] is already running.", meetingId, name) 
	      sender ! CreateMeetingResponse(true, descriptor, "Meeting already exists.", runningMeeting.session)         
      }
      case None => {
	      log.info("Creating meeting [{}] : [{}]", meetingId, name)
	      val runningMeeting = createMeeting(descriptor, internalId)	      
	      	      
	      log.debug("Replying to create meeting request. [{}] : [{}]", meetingId, name)
	      
	      sender ! CreateMeetingResponse(true, descriptor, "Meeting successfully created.",  runningMeeting.session)	
	      pubsub ! MeetingCreated(runningMeeting.session, descriptor)         
      }
    } 
  } 
}