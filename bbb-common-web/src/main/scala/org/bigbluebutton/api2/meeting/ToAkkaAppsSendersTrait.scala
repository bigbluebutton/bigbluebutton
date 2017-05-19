package org.bigbluebutton.api2.meeting

import org.bigbluebutton.api2.bus.MsgToAkkaAppsEventBus


trait ToAkkaAppsSendersTrait {
  val msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus

  def sendCreateMeetingRequestToAkkaApps(): Unit = {

  }
}
