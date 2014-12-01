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
	import mx.utils.ObjectUtil;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	import org.bigbluebutton.modules.sharednotes.events.CurrentDocumentEvent;
	import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
	import org.bigbluebutton.modules.sharednotes.events.ReceivePatchEvent;
	
	public class SharedNotesConnectionManager
	{
		public static const NAME:String = "SharedNotesService";
		
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

		private function get myUserId():String {
			return UserManager.getInstance().getConference().getMyUserId();
		}

		private function netStatusHandler(event:NetStatusEvent):void
		{
			var statusCode:String = event.info.code;
			
			switch ( statusCode ) 
			{
				case "NetConnection.Connect.Success":
					trace(NAME + ": connected!");
					break;
				default:
					trace(NAME + ": unknown error while connecting");
					break;
			}
			
		}
		
		public function currentDocument():void {
			var nc:NetConnection = _connection;
			nc.call(
				"sharedNotes.currentDocument",
				new Responder(
					function(result:Object):void {
						var currentDocumentEvent:CurrentDocumentEvent = new CurrentDocumentEvent();
						currentDocumentEvent.document = result;
						_dispatcher.dispatchEvent(currentDocumentEvent);
					},
					function(status:Object):void {
						trace(NAME + ":currentDocument - An error occurred"); 
						for (var x:Object in status) { 
							trace(x + " : " + status[x]); 
						} 
					}
				),
				myUserId
			);
		}

		private function asyncErrorHandler(event:AsyncErrorEvent):void {
			trace(NAME + ": sharedNotesSO asynchronous error (" + event + ")");
		}
		
		private function sharedObjectSyncHandler(event:SyncEvent):void {
			trace(NAME + ": sharedNotesSO connection established");
		}

		public function patchDocument(noteId:String, userid:String, patch:String, beginIndex:Number, endIndex:Number):void {
			var nc:NetConnection = _connection;
			nc.call("sharedNotes.patchDocument", null, noteId, userid, patch, beginIndex, endIndex);
		}

		private var debugResponder:Responder = new Responder(
				function(result:Object):void {
					trace("Success!");
					if (result != null) {
						trace(ObjectUtil.toString(result));
					}
				},
				function(status:Object):void {
					trace("An error occurred:");
					trace(ObjectUtil.toString(status));
				}
			);

		public function createAdditionalNotes():void {
			trace(NAME + ": sending request to create additional notes");
			_connection.call("sharedNotes.createAdditionalNotes", debugResponder);
		}

		public function createAdditionalNotesCallback(notesId:String):void {
			trace(NAME + ": received callback for createAdditionalNotes, notesId " + notesId);
			var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.CREATE_ADDITIONAL_NOTES_REPLY_EVENT);
			e.payload.notesId = notesId;
			_dispatcher.dispatchEvent(e);
		}

		public function destroyAdditionalNotes(notesId:String):void {
			trace(NAME + ": sending request to destroy additional notes " + notesId);
			_connection.call("sharedNotes.destroyAdditionalNotes", debugResponder, notesId);
		}

		public function destroyAdditionalNotesCallback(notesId:String):void {
			trace(NAME + ": received callback for destroyAdditionalNotes, notesId " + notesId);
			var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.DESTROY_ADDITIONAL_NOTES_REPLY_EVENT);
			e.payload.notesId = notesId;
			_dispatcher.dispatchEvent(e);
		}

		public function remoteModificationsCallBack(noteId:String, userid:String, patches:String, beginIndex:Number, endIndex:Number):void {

			LogUtil.debug(myUserId + " NoteId: " + noteId + " userId " + userid + "::" + patches);
			if(myUserId == userid) {
				var receivePatchEvent:ReceivePatchEvent = new ReceivePatchEvent();
				receivePatchEvent.noteId = noteId;
				receivePatchEvent.patch = patches;
				receivePatchEvent.beginIndex = beginIndex;
				receivePatchEvent.endIndex = endIndex;
				_dispatcher.dispatchEvent(receivePatchEvent);
			}
		}

		public function requestAdditionalNotesSet(additionalNotesSetSize:Number):void {
			trace(NAME + ": sending request of additional notes set " + additionalNotesSetSize.toString());
			_connection.call("sharedNotes.requestAdditionalNotesSet", debugResponder, additionalNotesSetSize);
		}
	}
}
