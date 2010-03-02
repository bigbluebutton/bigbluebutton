package org.bigbluebutton.deskshare.server.stream

import scala.actors.Actor
import scala.actors.Actor._

object StopStream
object StartStream 
class UpdateStream(val room: String, val videoData: Array[Byte])

abstract class Stream extends Actor