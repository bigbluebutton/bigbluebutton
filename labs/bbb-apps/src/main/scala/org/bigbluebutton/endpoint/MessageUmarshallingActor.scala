package org.bigbluebutton.endpoint

import akka.actor.{Actor, ActorRef, ActorLogging, Props}
import spray.json.{JsObject, JsonParser, DeserializationException}
import org.parboiled.errors.ParsingException
import org.bigbluebutton.apps.protocol.HeaderAndPayloadJsonSupport._
import org.bigbluebutton.apps.protocol._
import scala.util.{Try, Success, Failure}
import org.bigbluebutton.apps.users.protocol.UsersMessageUnmarshalling

object MessageUnmarshallingActor {
  def props(messageHandlerActor: ActorRef): Props =  
        Props(classOf[MessageUnmarshallingActor], messageHandlerActor)
}

class MessageUnmarshallingActor private (val messageHandlerActor: ActorRef) extends Actor 
         with ActorLogging with UsersMessageUnmarshalling {

  def receive = {
    case msg: String => handleMessage(msg)
    case badMsg => log.error("Unhandled message: [{}", badMsg)
  }
  
  def handleMessage(msg: String) = {
    unmarshall(msg) match {
      case Success(validMsg) => forwardMessage(validMsg)
      case Failure(ex) => log.error("Unhandled message: [{}]", ex)
    }
  }

  def forwardMessage(msg: HeaderAndJsonMessage) = {
    msg.header.name match {
      case InMsgNameConst.UserJoinRequest             => 
                    handleUserJoin(msg)
      case InMsgNameConst.UserLeaveEvent              => 
                    handleUserLeave(msg)
      case InMsgNameConst.GetUsersRequest             => 
                    handleGetUsers(msg)
      case InMsgNameConst.AssignPresenterRequest      => 
                    handleAssignPresenter(msg)
      
	  case _ => 
	    log.error("Unknown message name: [{}]", msg.header.name)
	}    
  }
    
  def header(msg: JsObject):Header = {
    try {
      msg.fields.get("header") match {
        case Some(header) => 
             header.convertTo[Header]
        case None => 
             throw MessageProcessException("Cannot get header: [" + msg + "]")
     }
    } catch {
      case e: DeserializationException =>
             throw MessageProcessException("Failed to deserialize header: [" + msg + "]")
    }
  }
 
  def payload(msg: JsObject):JsObject = {
    msg.fields.get("payload") match {
      case Some(payload) => 
           payload.asJsObject
      case None => 
           throw MessageProcessException("Cannot get payload information: [" + msg + "]")
    } 
  }
  
  def toJsObject(msg: String):JsObject = {  
    try {
      JsonParser(msg).asJsObject
    } catch {
      case e: ParsingException => {
        log.error("Cannot parse message: {}", msg)
        throw MessageProcessException("Cannot parse JSON message: [" + msg + "]")
      }
    }
  }

  def toHeaderAndJsonMessage(header: Header, message:String):HeaderAndJsonMessage = {
    HeaderAndJsonMessage(header, message)
  }
    
  def unmarshall(jsonMsg: String):Try[HeaderAndJsonMessage] = {
    for {
      jsonObj <- Try(toJsObject(jsonMsg))
      header <- Try(header(jsonObj))
      message = toHeaderAndJsonMessage(header, jsonMsg)
    } yield message
  }
  
}