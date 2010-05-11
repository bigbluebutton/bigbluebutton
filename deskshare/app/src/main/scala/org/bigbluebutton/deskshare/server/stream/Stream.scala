package org.bigbluebutton.deskshare.server.stream

import scala.actors.Actor
import scala.actors.Actor._
import java.awt.Point

object StopStream
object StartStream 
class UpdateStream(val room: String, val videoData: Array[Byte])
class UpdateStreamMouseLocation(val room: String, val loc: Point)

abstract class Stream extends Actor