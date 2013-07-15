/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
 * Author: Hugo Lazzari <hslazzari@gmail.com>
 */
package org.bigbluebutton.modules.sharednotes.managers
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
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	import org.bigbluebutton.modules.sharednotes.events.CurrentDocumentEvent;
	import org.bigbluebutton.modules.sharednotes.events.ReceivePatchEvent;
	
	public class SharedNotesConnectionManager
	{
		public static const NAME:String = "SharedNotesSharedObjectService";
		
		private var _sharedNotesSO:SharedObject;
		private var _connection:NetConnection;
		private var _dispatcher:Dispatcher;
		private var _locked:Boolean = false;
		/*
		 * the application of the first layout should be delayed to avoid
		 * strange movements of the windows before set the correct position
		 */
		
		public function SharedNotesConnectionManager(connection:NetConnection)
		{
			_connection = connection;
			_dispatcher = new Dispatcher();
		}
						
		public function join(uri:String):void
		{
			_sharedNotesSO = SharedObject.getRemote("sharedNotesSO", uri, false);
			_sharedNotesSO.addEventListener(NetStatusEvent.NET_STATUS, netStatusHandler);
			_sharedNotesSO.addEventListener(AsyncErrorEvent.ASYNC_ERROR, asyncErrorHandler);
			_sharedNotesSO.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);	
			_sharedNotesSO.client = this;
			_sharedNotesSO.connect(_connection);					
		}
		
		public function leave():void
		{
		    	if (_sharedNotesSO != null) {
		    		_sharedNotesSO.close();
		    	}
		}

		private function netStatusHandler(event:NetStatusEvent):void
		{
			var statusCode:String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success":
					LogUtil.debug("SUCESS");
					break;
				default:
					LogUtil.debug("ERROR");
					break;
			}
			
		}
		
		public function currentDocument(userid:String):void {
			var nc:NetConnection = _connection;
			nc.call(
				"sharedNotes.currentDocument",
				new Responder(
					function(result:Object):void {
						var currentDocumentEvent:CurrentDocumentEvent = new CurrentDocumentEvent();
						currentDocumentEvent.document = result.toString();
						_dispatcher.dispatchEvent(currentDocumentEvent);
					},
					function(status:Object):void {
						LogUtil.error("SharedNotesSharedObjectService:currentDocument - An error occurred"); 
						for (var x:Object in status) { 
							LogUtil.error(x + " : " + status[x]); 
						} 
					}
				),
				userid
			);
		}

		
		
		private function asyncErrorHandler(event:AsyncErrorEvent):void {
			LogUtil.debug("SharedNotesService: sharedNotesSO asynchronous error (" + event + ")");
		}
		
		private function sharedObjectSyncHandler(event:SyncEvent):void {
			LogUtil.debug("SharedNotesService: sharedNotesSO connection established");
			
		}

		public function patchDocument(userid:String, patch:String, beginIndex:Number, endIndex:Number):void {
			var nc:NetConnection = _connection;
			nc.call("sharedNotes.patchDocument", null, userid, patch, beginIndex, endIndex);
		}

		public function remoteModificationsCallBack(userid:String, patches:String, beginIndex:Number, endIndex:Number):void {
			if(UserManager.getInstance().getConference().getMyUserId() == userid) {
				var receivePatchEvent:ReceivePatchEvent = new ReceivePatchEvent();
				receivePatchEvent.patch = patches;
				receivePatchEvent.beginIndex = beginIndex;
				receivePatchEvent.endIndex = endIndex;
				_dispatcher.dispatchEvent(receivePatchEvent);
			}
		}
	}
}
