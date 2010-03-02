package org.bigbluebutton.deskshare.server.sessions

import org.bigbluebutton.deskshare.server.svc1.{BlockManager, Dimension}
import org.bigbluebutton.deskshare.server.stream.{StreamManager, Stream, UpdateStream, StartStream, StopStream}

import scala.actors.Actor
import scala.actors.Actor._
import net.lag.logging.Logger

case object Initialize
case class UpdateSessionBlock(position: Int, blockData: Array[Byte], keyframe: Boolean)
case object StopSession
case object GenerateKeyFrame

class SessionSVC(room: String, screenDim: Dimension, blockDim: Dimension, streamManager: StreamManager) extends Actor {
	private val log = Logger.get
	private val blockManager: BlockManager = new BlockManager(room, screenDim, blockDim)
	private val stream:Stream = streamManager.createStream(room, screenDim.width, screenDim.height)
 
	private val KEEP_ALIVE_TIME = 30000	
	private var lastUpdate = 0L
	private var stop = true
	private var count = 0
 
	def scheduleGenerateFrame() {
		val mainActor = self
		actor {
			log.debug("*** Scheduling frame ***")
			Thread.sleep(100)
			mainActor ! "GenerateFrame"
			log.debug("*** Sent generate frame message ****")
		}
	}
	
	def act() = {
      loop {
        react {
          case Initialize => initialize()
          case StopSession => stopSession()            
          case "GenerateFrame" => {
        	  	println("**** [" + count + "] Received generate frame **** stop=" + stop)
	            generateFrame(false)
	            if (!stop) scheduleGenerateFrame()
	            if (count > 1000) {
	              self ! GenerateKeyFrame
	              count = 0
	            } else {	              
	              count = count + 1
	            }
            }
          case GenerateKeyFrame => {
        	  println("Generating Key Frame !!!!!")
        	  generateFrame(true)
            }
          case b: UpdateSessionBlock => updateBlock(b.position, b.blockData, b.keyframe)
          case _ => println("*** Unknown message ****")
        }
      }
    }

	private def initialize(): Unit = {
		blockManager.initialize();
		lastUpdate = System.currentTimeMillis();	
		stop = false
		stream ! StartStream
		generateFrame(true)
		scheduleGenerateFrame()
	}
 
	private def stopSession() {
		stream ! StopStream
		stop = true
	}
	
	private def updateBlock(position: Int, videoData: Array[Byte], keyFrame: Boolean): Unit = {
		blockManager.updateBlock(position, videoData, keyFrame)
		lastUpdate = System.currentTimeMillis()		
	}
	
	private def generateFrame(keyframe:Boolean) {
		println("Generating frame " + keyframe)
		stream ! new UpdateStream(room, blockManager.generateFrame(keyframe))
	}
 
	def keepAlive(): Boolean = {
		return (System.currentTimeMillis() - lastUpdate) < KEEP_ALIVE_TIME;
	}
}
