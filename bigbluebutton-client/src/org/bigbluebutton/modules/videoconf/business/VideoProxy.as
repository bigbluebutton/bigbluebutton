/**
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
*/
package org.bigbluebutton.modules.videoconf.business
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.NetConnection;
	import flash.net.NetStream;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.UserManager;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
	import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
	import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;
	
	public class VideoProxy
	{
		private var nc:NetConnection;
		private var ns:NetStream;
		
		public function VideoProxy(url:String)
		{
			nc = new NetConnection();
			nc.client = this;
			nc.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
			nc.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			nc.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
			nc.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			nc.connect(url);
		}
		
		private function onAsyncError(event:AsyncErrorEvent):void{
		}
		
		private function onIOError(event:NetStatusEvent):void{
		}
		
		private function onNetStatus(event:NetStatusEvent):void{
			switch(event.info.code){
				case "NetConnection.Connect.Failed":
					break;
				case "NetConnection.Connect.Success":
					ns = new NetStream(nc);
					openAvailableVideos();
					break;
				case "NetConnection.Connect.Rejected":
					break;
				case "NetConnection.Connect.Closed":
					break;
				case "NetConnection.Connect.InvalidApp":
					break;
				case "NetConnection.Connect.AppShutdown":
					break;
					
				case "NetStream.Publish.Start":
					LogUtil.debug("NetStream.Publish.Start for broadcast stream [");
					break;
					
				case "NetStream.Publish.Idle":
					LogUtil.debug("NetStream.Publish.Idle for broadcast stream [");
					break;
					
				case "NetStream.Record.Failed":
					LogUtil.debug("NetStream.Record.Failed for broadcast stream [");
					break;
					
				case "NetStream.Record.Stop":
					LogUtil.debug("NetStream.Record.Stop for broadcast stream [");
					break;
					
				case "NetStream.Record.Start":
					LogUtil.debug("NetStream.Record.Start for broadcast stream [");
					break;
					
				case "NetStream.Unpublish.Success":
					LogUtil.debug("NetStream.Unpublish.Success for broadcast stream [");
					break;
					
				case "NetStream.Publish.BadName":
					LogUtil.debug("NetStream.Publish.BadName for broadcast stream [");
					break;
			}
		}
		
		private function onSecurityError(event:NetStatusEvent):void{
		}
		
		public function get connection():NetConnection{
			return this.nc;
		}
		
		public function startPublishing(e:StartBroadcastEvent):void{
			ns.addEventListener( NetStatusEvent.NET_STATUS, onNetStatus );
			ns.addEventListener( IOErrorEvent.IO_ERROR, onIOError );
			ns.addEventListener( AsyncErrorEvent.ASYNC_ERROR, onAsyncError );
			ns.client = this;
			ns.attachCamera(e.camera);
			ns.publish(e.stream);
		}
		
		public function stopBroadcasting():void{
			if (ns != null) {
				ns.attachCamera(null);
				ns.close();
				ns = null;
				ns = new NetStream(nc);
			}			
		}
		
		public function disconnect():void {
			if (nc != null) nc.close();
		}
		
		public function onBWDone():void{
			
		}
		
		public function openAvailableVideos():void{
			var dispatcher:Dispatcher = new Dispatcher();
			var users:ArrayCollection = UserManager.getInstance().getConference().users;
			for (var i:int=0; i<users.length; i++){
				var user:BBBUser = (users.getItemAt(i) as BBBUser);
				if (user.hasStream) dispatcher.dispatchEvent(new StreamStartedEvent(user.userid, user.name, user.streamName));
			}
		}

	}
}