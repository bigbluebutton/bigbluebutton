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
package org.bigbluebutton.modules.layout.services
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.AsyncErrorEvent;
	import flash.events.IEventDispatcher;
	import flash.events.NetStatusEvent;
	import flash.events.SyncEvent;
	import flash.events.TimerEvent;
	import flash.net.NetConnection;
	import flash.net.Responder;
	import flash.net.SharedObject;
	import flash.utils.Timer;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.EventConstants;
	import org.bigbluebutton.core.events.CoreEvent;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.ModuleLoadEvent;
	import org.bigbluebutton.modules.layout.events.ConnectionEvent;
	import org.bigbluebutton.modules.layout.events.LayoutEvent;
	import org.bigbluebutton.modules.layout.events.RedefineLayoutEvent;
	import org.bigbluebutton.modules.layout.model.LayoutDefinition;
	import org.bigbluebutton.util.i18n.ResourceUtil;

	public class LayoutSharedObjectService
	{
		public static const NAME:String = "LayoutSharedObjectService";
		
		private var _layoutSO:SharedObject = null;
		private var _connection:NetConnection;
		private var _dispatcher:Dispatcher;
		private var _locked:Boolean = false;
		/*
		 * the application of the first layout should be delayed to avoid
		 * strange movements of the windows before set the correct position
		 */
		private var _applyFirstLayoutTimer:Timer = new Timer(750,1);
		
		public function LayoutSharedObjectService(connection:NetConnection)
		{
			_connection = connection;
			_dispatcher = new Dispatcher();
		}
						
	    public function join(uri:String):void
		{
			if (_layoutSO == null) {
				_layoutSO = SharedObject.getRemote("layoutSO", uri, false);
				_layoutSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
				_layoutSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
				_layoutSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
				_layoutSO.client = this;
			}
			_layoutSO.connect(_connection);					
		}
		
	    public function leave():void
	    {
    		_layoutSO.close();
	    }

		private function netStatusHandler(event:NetStatusEvent):void
		{
			var statusCode:String = event.info.code;
			var connEvent:ConnectionEvent = new ConnectionEvent(ConnectionEvent.CONNECT_EVENT);
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success":
					connEvent.success = true;
					break;
				default:
					connEvent.success = false;
				   break;
			}
			_dispatcher.dispatchEvent(connEvent);
		}
		
		public function initLayout():void {
			var nc:NetConnection = _connection;
			nc.call(
				"layout.init",
				new Responder(
					function(result:Object):void {
						_applyFirstLayoutTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
							onReceivedFirstLayout(result);
						});
						_applyFirstLayoutTimer.start();
					},
					function(status:Object):void {
						LogUtil.error("LayoutSharedObjectService:initLayout - An error occurred"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)
			);
		}
		
		private function onReceivedFirstLayout(result:Object):void {
			LogUtil.debug("LayoutService: handling the first layout"); 
			var locked:Boolean = result[0];
			var userID:String = result[1];
			var layout:String = result[2];
			if (locked)
				remoteUpdateLayout(locked, userID, layout);
			else
				_dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.APPLY_DEFAULT_LAYOUT_EVENT));
      
      _dispatcher.dispatchEvent(new ModuleLoadEvent(ModuleLoadEvent.LAYOUT_MODULE_STARTED));
		}
		
		public function lockLayout(layout:LayoutDefinition):void {
			var nc:NetConnection = _connection;
			nc.call(
				"layout.lock",
				new Responder(
					function(result:Object):void {
					},
					function(status:Object):void {
						LogUtil.error("LayoutSharedObjectService:lockLayout - An error occurred"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				),
				UserManager.getInstance().getConference().getMyUserId(),
				layout.toXml().toXMLString()
			);
		}
		
		public function unlockLayout():void {
			var nc:NetConnection = _connection;
			nc.call(
				"layout.unlock",
				new Responder(
					function(result:Object):void {
					},
					function(status:Object):void {
						LogUtil.error("LayoutSharedObjectService:unlockLayout - An error occurred"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				)
			);
		}

		public function remoteUpdateLayout(locked:Boolean, userID:String, layout:String):void {
			var dispatchedByMe:Boolean = UserManager.getInstance().getConference().amIThisUser(userID);

			LogUtil.debug("LayoutService: received a remote update" + (locked? " from " + (dispatchedByMe? "myself": "a remote user"): ""));
			LogUtil.debug("Locked? " + (locked? "yes": "no"));
			
			if (!_locked && locked) {
				_dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.REMOTE_LOCK_LAYOUT_EVENT));
        _dispatcher.dispatchEvent(new CoreEvent(EventConstants.REMOTE_LOCKED_LAYOUT));
			} else if (_locked && !locked) {
				_dispatcher.dispatchEvent(new LayoutEvent(LayoutEvent.REMOTE_UNLOCK_LAYOUT_EVENT));
        _dispatcher.dispatchEvent(new CoreEvent(EventConstants.REMOTE_UNLOCKED_LAYOUT));
			}
			
			if (locked && !dispatchedByMe) {
				LogUtil.debug("LayoutService: handling remote layout");
				LogUtil.debug(layout);
				var layoutDefinition:LayoutDefinition = new LayoutDefinition();
				layoutDefinition.load(new XML(layout));
				layoutDefinition.name = "[" + ResourceUtil.getInstance().getString('bbb.layout.combo.remote') + "] " + layoutDefinition.name;  
				var redefineLayout:RedefineLayoutEvent = new RedefineLayoutEvent();
				redefineLayout.layout = layoutDefinition;
				redefineLayout.remote = true;
				_dispatcher.dispatchEvent(redefineLayout);
			}
			_locked = locked;
		}
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
			LogUtil.debug("LayoutService: layoutSO asynchronous error (" + event + ")");
		}
		
		private function sharedObjectSyncHandler(event:SyncEvent):void {
			LogUtil.debug("LayoutService: layoutSO connection established");
			var connEvent:ConnectionEvent = new ConnectionEvent(ConnectionEvent.CONNECT_EVENT);	
			connEvent.success = true;
			_dispatcher.dispatchEvent(connEvent);
		}
	}
}