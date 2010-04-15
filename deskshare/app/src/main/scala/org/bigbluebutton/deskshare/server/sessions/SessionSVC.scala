package org.bigbluebutton.deskshare.server.sessions

import org.bigbluebutton.deskshare.server.svc1.{BlockManager, Dimension}
import org.bigbluebutton.deskshare.server.stream.{StreamManager, Stream, UpdateStream, StartStream, StopStream}

import scala.actors.Actor
import scala.actors.Actor._
import net.lag.logging.Logger

case object StartSession
case class UpdateSessionBlock(position: Int, blockData: Array[Byte], keyframe: Boolean)
case object StopSession
case object GenerateKeyFrame

class SessionSVC(sessionManager:SessionManagerSVC, room: String, screenDim: Dimension, blockDim: Dimension, streamManager: StreamManager) extends Actor {
	private val log = Logger.get
 
	private val blockManager: BlockManager = new BlockManager(room, screenDim, blockDim)
	private val stream:Stream = streamManager.createStream(room, screenDim.width, screenDim.height)
	private var lastUpdate:Long = System.currentTimeMillis()
 
	private var stop = true

	def scheduleGenerateFrame() {
		val mainActor = self
		actor {
			Thread.sleep(100)
			mainActor ! "GenerateFrame"
		}
	}
	
	def act() = {
      loop {
        react {
          case StartSession => initialize()
          case StopSession => stopSession()            
          case "GenerateFrame" => {
	            generateFrame(false)
	            if (!stop) scheduleGenerateFrame()
            }
          case GenerateKeyFrame => {
        	  log.debug("Generating Key Frame for room %s", room)
        	  generateFrame(true)
            }
          case b: UpdateSessionBlock => updateBlock(b.position, b.blockData, b.keyframe)
          case m: Any => log.warning("Unknown message [%s]", m)
        }
      }
    }

	private def initialize() {
		blockManager.initialize()	
		stop = false
		stream ! StartStream
		generateFrame(true)
		scheduleGenerateFrame()
	}
 
	private def stopSession() {
		stream ! StopStream
		stop = true
		streamManager.destroyStream(room)
	}
	
	private def updateBlock(position: Int, videoData: Array[Byte], keyFrame: Boolean): Unit = {
		lastUpdate = System.currentTimeMillis()
		blockManager.updateBlock(position, videoData, keyFrame)	
	}
	
	private def generateFrame(keyframe:Boolean) {		
		stream ! new UpdateStream(room, blockManager.generateFrame(keyframe))  
		if (System.currentTimeMillis() - lastUpdate > 60000) {
			log.warning("Did not received updates for more than 1 minute. Removing session %s", room)
			sessionManager ! new RemoveSession(room)
		}
	}
}
