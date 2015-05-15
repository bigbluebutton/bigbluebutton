package org.bigbluebutton.apps

import org.bigbluebutton.apps._
import org.bigbluebutton.apps._
import org.bigbluebutton.apps.users.data._

trait MeetingManagerTestFixtures extends AppsTestFixtures {
  
  def generateCreateMeetingMessage():CreateMeeting = {  
     CreateMeeting(eng101Desc)
  }
}