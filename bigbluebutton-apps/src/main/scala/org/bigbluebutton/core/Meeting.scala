package org.bigbluebutton.core

import scala.actors.Actor
import scala.actors.Actor._
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.apps.poll.Poll
import org.bigbluebutton.core.apps.poll.PollApp
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.api.InMessage
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.apps.presentation.PresentationApp

case object StopMeetingActor

class Meeting(val meetingID: String, val recorded: Boolean, val voiceBridge: String, outGW: MessageOutGateway) extends Actor {

  import org.bigbluebutton.core.apps.poll.messages._
  import org.bigbluebutton.core.api.Presenter
   
  val usersApp = new UsersApp(meetingID, recorded, outGW)
  val presentationApp = new PresentationApp(meetingID, recorded, outGW, usersApp)
  val pollApp = new PollApp(meetingID, recorded, outGW, usersApp)
  
  	def act() = {
	  loop {
	    react {
	      case msg: InMessage => {
	        usersApp.handleMessage(msg)
	        presentationApp.handleMessage(msg)
	        pollApp.handleMessage(msg)
	      }
	      case StopMeetingActor => exit
	    }
	  }
  	}
  	

}