/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.modules.deskshare.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.NetConnection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.deskshare.services.red5.Connection;
	
	/**
	 * The DeskShareProxy communicates with the Red5 deskShare server application 
	 * @author Snap
	 * 
	 */	
	public class DeskshareService
	{	
		private var conn:Connection;

		private var module:DeskShareModule;
		private var dispatcher:Dispatcher;
		

		private var uri:String;
		private var room:String;
    
		public function DeskshareService() {
			this.dispatcher = new Dispatcher();			
		}
		
		public function handleStartModuleEvent(module:DeskShareModule):void {
			LogUtil.debug("Deskshare Module starting");
			this.module = module;			
			connect(module.uri, module.getRoom());
		}
		
		public function connect(uri:String, room:String):void {
			this.uri = uri;
      this.room = room;
			trace("Deskshare Service connecting to " + uri);
			conn = new Connection(room);

			conn.setURI(uri);
			conn.connect();
		
		}
			
    public function getConnection():NetConnection{
      return conn.getConnection();
    }
    
    public function disconnect():void{
      conn.disconnect();
    }
		
    public function sendStartViewingNotification(captureWidth:Number, captureHeight:Number):void{
      conn.sendStartViewingNotification(captureWidth, captureHeight);
    }
		
    public function sendStartedViewingNotification(stream:String):void{
      conn.sendStartedViewingNotification(stream);
    }
    
    public function stopSharingDesktop(meetingId: String, stream: String):void {
      conn.stopSharingDesktop(meetingId, stream);
    }
    
	}
}