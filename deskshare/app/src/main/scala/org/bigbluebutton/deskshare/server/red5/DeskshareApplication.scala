package org.bigbluebutton.deskshare.server.red5

import org.bigbluebutton.deskshare.server.stream.StreamManager
import org.bigbluebutton.deskshare.server.socket.DeskShareServer
import org.red5.server.adapter.MultiThreadedApplicationAdapter
import org.red5.server.api.IConnection
import org.red5.server.api.IScope
import scala.actors.Actor
import scala.actors.Actor._

import net.lag.configgy.Configgy
import net.lag.logging.Logger
import java.io.File
import java.util.concurrent.CountDownLatch

class DeskshareApplication(streamManager: StreamManager, deskShareServer: DeskShareServer) extends MultiThreadedApplicationAdapter {
	private val deathSwitch = new CountDownLatch(1)

	// load our config file and configure logfiles.
	Configgy.configure("webapps/deskshare/WEB-INF/deskshare.conf")
 
	private val logger = Logger.get 
	var appScope: IScope = null
 
	override def appStart(app: IScope): Boolean = {
		logger.debug("deskShare appStart");
		appScope = app
      // make sure there's always one actor running so scala 2.7.2 doesn't kill off the actors library.
      actor {
			deathSwitch.await
		}
    
		streamManager.setDeskshareApplication(this)
		deskShareServer.start();
		super.appStart(app)
	}
	
	override def appConnect(conn: IConnection, params: Array[Object]): Boolean = {
		logger.debug("deskShare appConnect to scope " + conn.getScope().getContextPath());
		super.appConnect(conn, params);
	}
	
	override def appDisconnect(conn: IConnection) {
		logger.debug("deskShare appDisconnect");
		super.appDisconnect(conn);
	}
	
	override def appStop(app: IScope) {
		logger.debug("Stopping deskshare")
		deskShareServer.stop();
		super.appStop(app)
	}
 
	def getAppScope(): IScope = {
		appScope;
	}
}
