package org.bigbluebutton.apps.presentation

import akka.actor.{ActorRef, actorRef2Scala}
import akka.event.LoggingAdapter
import org.bigbluebutton.apps.RunningMeetingActor
import org.bigbluebutton.apps.presentation.messages._

trait PresentationAppHandler {
  this : RunningMeetingActor =>
  
  val pubsub: ActorRef
  val log: LoggingAdapter

  val presApp = new PresentationApp()
  
  def handleClearPresentation(msg: ClearPresentation) = {
    presApp.clearPresentation(msg.presentation.id)
    
    pubsub ! PresentationCleared(session, msg.presentation, msg.clearedBy)    
  }
  
  def handleRemovePresentation(msg : RemovePresentation) = {
    val pres = presApp.removePresentation(msg.presentation.id)
    pubsub ! PresentationRemoved(session, msg.presentation, msg.removedBy)
  }

  def handleSendCursorUpdate(msg: SendCursorUpdate) = {
    pubsub ! UpdateCursorPosition(session, msg.xPercent, msg.yPercent)
  }
  
  def handleResizeAndMoveSlide(msg: ResizeAndMovePage) = {
    val page = presApp.resizeAndMovePage(msg.presentation.id,
                              msg.page, msg.position)
    page foreach { p =>
      pubsub ! PageMoved(session, msg.presentation, p)
    }
  }

  def handleDisplayPage(msg: DisplayPage) = {
    val page = presApp.displayPage(msg.presentation.id, msg.page) 
    page foreach { p =>
      pubsub ! PageDisplayed(session, msg.presentation, p)
    }
  }

  def handleSharePresentation(msg: SharePresentation) = {
    val presentation = presApp.sharePresentation(msg.presentation.id)
    presentation foreach {pres =>
      pubsub ! PresentationShared(session, pres)
      
      self ! DisplayPage(session, msg.presentation, 1)
    }
  }
  
  def handlePreuploadedPresentations(msg: PreuploadedPresentations) = {
    msg.presentations foreach {p => presApp.newPresentation(p)}
  }

  def handlePresentationConverted(msg: PresentationConverted) = {
    presApp.newPresentation(msg.presentation)
  }

}