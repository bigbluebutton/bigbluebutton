package org.bigbluebutton.core.domain

case class WebcamStream(id: String, viewers: Set[IntUserId], publisher: IntUserId, url: String)