package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway

trait BreakoutRoomApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

}