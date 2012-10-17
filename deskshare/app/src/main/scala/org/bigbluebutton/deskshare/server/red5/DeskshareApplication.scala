/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.deskshare.server.red5

import org.red5.server.api.{IContext, IScope, ScopeUtils, IConnection}
import org.red5.server.so.SharedObjectService
import org.red5.server.api.so.{ISharedObject, ISharedObjectService}
import org.red5.server.stream.{BroadcastScope, IBroadcastScope, IProviderService}
import org.bigbluebutton.deskshare.server.ScreenVideoBroadcastStream
import org.bigbluebutton.deskshare.server.stream.StreamManager
import org.bigbluebutton.deskshare.server.socket.DeskShareServer
import org.bigbluebutton.deskshare.server.MultiThreadedAppAdapter
import scala.actors.Actor
import scala.actors.Actor._

import net.lag.configgy.Configgy
import net.lag.logging.Logger
import java.io.File
import java.util.concurrent.CountDownLatch

class DeskshareApplication(streamManager: StreamManager, deskShareServer: DeskShareServer) extends MultiThreadedAppAdapter {
	private val deathSwitch = new CountDownLatch(1)

	// load our config file and configure logfiles.
	Configgy.configure("webapps/deskshare/WEB-INF/deskshare.conf")
 
	private val logger = Logger.get 
	var appScope: IScope = null
 
	override def appStart(app: IScope): Boolean = {
		logger.debug("deskShare appStart");
		appScope = app
		super.setScope(appScope)
		if (appScope == null) println ("APSCOPE IS NULL!!!!")
		else println("APPSCOPE is NOT NULL!!!!")
  
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
 
	def getApplicationScope(): IScope = {
		if (appScope == null) println ("getAppScope: APSCOPE IS NULL!!!!")
		else println("getAppScope: APPSCOPE is NOT NULL!!!!")
		appScope;
	}
 
	def getAppSharedObject(): ISharedObject = {
		if (appScope == null) println ("getAppSharedObject: APSCOPE IS NULL!!!!")
		else println("getAppSharedObject: APPSCOPE is NOT NULL!!!!")
	    return getSharedObject(appScope, "deskSO")
	}
 
	private def getRoomScope(room:String):Option[IScope] = {
		if (appScope == null) {
		  logger.error("Cannot find room scope %s because app scope is null", room)
		  return None
		}
  
		var roomScope: IScope  = ScopeUtils.resolveScope(appScope, room)
	   
		if (roomScope == null) {
			if (appScope.createChildScope(room)) {
				logger.debug("RoomScope %s created", room)
				
				roomScope = ScopeUtils.resolveScope(appScope, room)
				
				if (roomScope == null) {
				  logger.error("****!!!!!!! ROOM SCOPE IS NULL!!!!!!*")
				  println("****!!!!!!! ROOM SCOPE IS NULL!!!!!!*")
				}
			} else {
				logger.error("Failed to create room scope %s", room)
				return None
			}
		} else {
				logger.debug("Room scope %s was found", room)
		}
    	return Some(roomScope)
	}
 
	private def getRoomSharedObject(roomScope:IScope):Option[ISharedObject] = {
		if (roomScope == null) {
		   logger.error("Cannot get shared object because room scope is null.")
		   return None
		} 
		
		var deskSO: ISharedObject = getSharedObject(roomScope, "deskSO")
   
		if (deskSO == null) {	
			if (createSharedObject(roomScope, "deskSO", false)) {
				  deskSO = getSharedObject(roomScope, "deskSO")
			} else {
				println ("Failed to create shared object")
				return None
			}
		}
		return Some(deskSO)
	}
 
 	def createDeskshareClient(name: String): Option[RtmpClientAdapter] = {
 		getRoomScope(name) match {
	     case None => logger.error("Failed to get room scope %s", name)
	     case Some(roomScope) => {
	    	 getRoomSharedObject(roomScope) match {
	    	   case None => logger.error("Failed to get shared object for room %s",name)
	    	   case Some(deskSO) => {
	    		   return Some(new RtmpClientAdapter(deskSO))
	    	   }
	    	 }
	       }
	   }
	   
	   return None
 	
 	}
 	
	def createScreenVideoBroadcastStream(name: String): Option[ScreenVideoBroadcastStream] = {	  
	   getRoomScope(name) match {
	     case None => logger.error("Failed to get room scope %s", name)
	     case Some(roomScope) => {
	    	 getRoomSharedObject(roomScope) match {
	    	   case None => logger.error("Failed to get shared object for room %s",name)
	    	   case Some(deskSO) => {
	    		   return createBroadcastStream(name, roomScope)
	    	   }
	    	 }
	       }
	   }
	   
	   return None	   
	}
 
	private def createBroadcastStream(name:String, roomScope:IScope):Option[ScreenVideoBroadcastStream] = {
		if (name == null || roomScope == null) {
		   logger.error("Cannot create broadcast stream. Invalid parameter")
		   return None
		}
  
		var broadcastStream = new ScreenVideoBroadcastStream(name)
		broadcastStream.setPublishedName(name)
		broadcastStream.setScope(roomScope)
    
		val context: IContext  = roomScope.getContext()
		
		val providerService: IProviderService  = context.getBean(IProviderService.BEAN_NAME).asInstanceOf[IProviderService]
		if (providerService.registerBroadcastStream(roomScope, name, broadcastStream)) {
			var bScope: BroadcastScope = providerService.getLiveProviderInput(roomScope, name, true).asInstanceOf[BroadcastScope]			
			bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, broadcastStream)
		} else{
			logger.error("DeskShareStream: Could not register broadcast stream")
		}
    
	   return Some(broadcastStream)
	}
}
