package org.bigbluebutton.apps.users.protocol

import akka.actor.ActorRef
import akka.event.LoggingAdapter
import spray.json._
import spray.json.DefaultJsonProtocol._
import org.parboiled.errors.ParsingException
import org.bigbluebutton.apps.protocol.Header
import org.bigbluebutton.apps.users.messages._
import org.bigbluebutton.apps.users.data.Presenter
import org.bigbluebutton.apps.protocol.MessageProcessException
import org.bigbluebutton.apps.protocol.HeaderAndJsonMessage
import org.bigbluebutton.endpoint.MessageUnmarshallingActor
import org.bigbluebutton.apps.Session
import org.bigbluebutton.endpoint.UserMessagesProtocol
import org.bigbluebutton.endpoint.UserLeaveMessage
import org.bigbluebutton.endpoint.UserJoinRequestFormat
import org.bigbluebutton.endpoint.GetUsersRequestMessage
import org.bigbluebutton.endpoint.AssignPresenterMessage

trait UsersMessageUnmarshalling {
  this : MessageUnmarshallingActor =>
  
  val messageHandlerActor: ActorRef
  val log: LoggingAdapter
  
  def handleUserJoin(msg: HeaderAndJsonMessage) = {
    def message(msg: HeaderAndJsonMessage):Option[UserJoinRequestFormat] = {    
      import UserMessagesProtocol._
      try {
        Some(JsonParser(msg.jsonMessage).asJsObject.convertTo[UserJoinRequestFormat])
      }  catch {
        case e: DeserializationException => {
          log.error("Failed to deserialize UserJoinRequestMessage: [{}]", msg.jsonMessage)
          None
        } 
        case e: ParsingException => {
          log.error("Invalid JSON Format : [{}]", msg)
          None
        }
      }
    }
        
    message(msg) foreach { ujm => messageHandlerActor ! ujm }
  }
  
  def handleUserLeave(msg: HeaderAndJsonMessage) = {   
    def message(msg: HeaderAndJsonMessage):Option[UserLeaveMessage] = {    
      import UserMessagesProtocol._
      try {
        Some(JsonParser(msg.jsonMessage).asJsObject.convertTo[UserLeaveMessage])
      }  catch {
        case e: DeserializationException => {
          log.error("Failed to deserialize UserLeaveMessage: [{}]", msg.jsonMessage)
          None
        } 
        case e: ParsingException => {
          log.error("Invalid JSON Format : [{}]", msg)
          None
        }
      }
    }   

    message(msg) foreach { ulm => messageHandlerActor ! ulm }    
  }
  
  def handleGetUsers(msg: HeaderAndJsonMessage) = {
    def message(msg: HeaderAndJsonMessage):Option[GetUsersRequestMessage] = {    
      import UserMessagesProtocol._
      try {
        Some(JsonParser(msg.jsonMessage).asJsObject.convertTo[GetUsersRequestMessage])
      }  catch {
        case e: DeserializationException => {
          log.error("Failed to deserialize GetUsersRequestMessage: [{}]", msg.jsonMessage)
          None
        } 
        case e: ParsingException => {
          log.error("Invalid JSON Format : [{}]", msg)
          None
        }
      }
    }   

    message(msg) foreach { gum => messageHandlerActor ! gum }   
  }
  
  def handleAssignPresenter(msg: HeaderAndJsonMessage) = {
    def message(msg: HeaderAndJsonMessage):Option[AssignPresenterMessage] = {    
      import UserMessagesProtocol._
      try {
        Some(JsonParser(msg.jsonMessage).asJsObject.convertTo[AssignPresenterMessage])
      }  catch {
        case e: DeserializationException => {
          log.error("Failed to deserialize AssignPresenterMessage: [{}]", msg.jsonMessage)
          None
        } 
        case e: ParsingException => {
          log.error("Invalid JSON Format : [{}]", msg)
          None
        }
      }
    }   

    message(msg) foreach { apm => messageHandlerActor ! apm }     
  }
}