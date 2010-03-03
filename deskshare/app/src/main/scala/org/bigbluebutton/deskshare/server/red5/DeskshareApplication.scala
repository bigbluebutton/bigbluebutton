package org.bigbluebutton.deskshare.server.red5

import org.bigbluebutton.deskshare.server.stream.StreamManager
import org.bigbluebutton.deskshare.server.socket.DeskShareServer
import org.red5.server.adapter.MultiThreadedApplicationAdapter
import org.red5.server.api.IConnection
import org.red5.server.api.IScope

class DeskshareApplication(streamManager: StreamManager, deskShareServer: DeskShareServer) extends MultiThreadedApplicationAdapter {
	var appScope: IScope = null
 
	override def appStart(app: IScope): Boolean = {
		println("deskShare appStart");
		appScope = app
		streamManager.setDeskshareApplication(this)
		deskShareServer.start();
		super.appStart(app)
	}
	
	override def appConnect(conn: IConnection, params: Array[Object]): Boolean = {
		println("deskShare appConnect to scope " + conn.getScope().getContextPath());
		super.appConnect(conn, params);
	}
	
	override def appDisconnect(conn: IConnection) {
		println ("deskShare appDisconnect");
		super.appDisconnect(conn);
	}
	
	override def appStop(app: IScope) {
		deskShareServer.stop();
		super.appStop(app)
	}
 
	def getAppScope(): IScope = {
		appScope;
	}
}
