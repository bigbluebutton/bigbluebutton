/*
	This file is part of BBB-Notes.
	
	Copyright (c) Islam El-Ashi. All rights reserved.
	
	BBB-Notes is free software: you can redistribute it and/or modify
	it under the terms of the Lesser GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or 
	any later version.
	
	BBB-Notes is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	Lesser GNU General Public License for more details.
	
	You should have received a copy of the Lesser GNU General Public License
	along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.
	
	Author: Islam El-Ashi <ielashi@gmail.com>, <http://www.ielashi.com>
*/
package org.bigbluebutton.modules.sharednotes.infrastructure
{
	import com.adobe.crypto.SHA1;
	import com.adobe.serialization.json.JSON;
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.IEventDispatcher;
	import flash.events.TimerEvent;
	import flash.events.SyncEvent;
	import flash.net.SharedObject;
	import flash.utils.ByteArray;	
	import flash.utils.Timer;
	
 	//import mx.events.StateChangeEvent;
 	import mx.events.FlexEvent; 	
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.sharednotes.components.PatchableTextArea;
	import org.bigbluebutton.modules.sharednotes.util.DiffPatch;
	import org.bigbluebutton.modules.sharednotes.SharedNotesWindow;

	public class Client
	{
		private var _id:int;
		
		private var textArea:PatchableTextArea;	// the text component to display the document
		private var documentShadow:String = ""; // the shadow of the current document
		private var initialDocument:String;	// for storing the initial document
		
		private var logPrefix:String;		// used for logging
		
		private var patchHistory:Array = new Array();		// a history of the patches
		
		private var server:ServerConnection;
		
		private var testCharacterTimer:Timer;
		private var timeoutTimer:Timer;
		
		private var _documentName:String = "";
		private var _host:String = "";
		private var so:SharedObject = null;
		
		private var _dispatcher:SharedNotesDispatcher = new SharedNotesDispatcher();
		private var _state:String = SharedNotesDispatcher.STATE_NONE;
	
		public function Client(window:SharedNotesWindow) {
			textArea = window.textArea;
			_documentName = window.room;
			_host = window.host;
			
			// this event comes from the SharedNotesWindow class
			window.addEventListener(SharedNotesDispatcher.SEND_PATCH_EVENT, function(e:Event):void {
				_dispatcher.dispatchDelayedEvent(new Event(SharedNotesDispatcher.SEND_PATCH_EVENT));
			});
			_dispatcher.addEventListener(SharedNotesDispatcher.INIT_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + _state);
				_state = SharedNotesDispatcher.STATE_INIT;
			});
			_dispatcher.addEventListener(SharedNotesDispatcher.SEND_PATCH_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + _state);
				switch(_state) {
					case SharedNotesDispatcher.STATE_INIT:
						sendMessage();
						_state = SharedNotesDispatcher.STATE_WAITING_PATCH_APPROVAL;
						break;
					default:
						LogUtil.debug("Inconsistent state!");
						break;
				}
			});
			_dispatcher.addEventListener(SharedNotesDispatcher.HANDLE_PATCH_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + _state);
				switch(_state) {
					case SharedNotesDispatcher.STATE_WAITING_PATCH_APPROVAL:
						//_dispatcher.dispatchDelayedEvent(new Event(SharedNotesDispatcher.UPDATE_REMOTE_EVENT));
						LogUtil.debug("Sending refresh");			
						so.send("refresh", _id);
						_state = SharedNotesDispatcher.STATE_UPDATING_REMOTE_USERS;
						break;
					case SharedNotesDispatcher.STATE_WAITING_REMOTE_PATCH:
						_state = SharedNotesDispatcher.STATE_INIT;
						break;
					default:
						LogUtil.debug("Inconsistent state!");
						break;
				}
			});
			_dispatcher.addEventListener(SharedNotesDispatcher.UPDATE_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + _state);
				switch(_state) {
					case SharedNotesDispatcher.STATE_UPDATING_REMOTE_USERS:
						_state = SharedNotesDispatcher.STATE_INIT;
						break;
					case SharedNotesDispatcher.STATE_INIT:
						sendMessage();
						_state = SharedNotesDispatcher.STATE_WAITING_REMOTE_PATCH;
						break;
					default:
						LogUtil.debug("Inconsistent state!");
						break;
				}
			});
			
			timeoutTimer = new Timer(window.responseTimeout);
			timeoutTimer.addEventListener(TimerEvent.TIMER, function(e:Event):void {
				timeoutTimer.stop();
				sendMessage();
			});
			
			// used for testing
			testCharacterTimer = new Timer(10);
			testCharacterTimer.addEventListener(TimerEvent.TIMER, playSentence);
			
			so = SharedObject.getRemote("sharedNotesSO", window.uri + "/" + window.room, false);
			so.addEventListener(SyncEvent.SYNC, sharedObjectSyncHandler);
			so.client = this;
			so.connect(window.connection);

			server = new HTTPServerConnection(this, window);
		}

		private function sharedObjectSyncHandler(event:SyncEvent):void {	
			LogUtil.debug("SharedObject SyncEvent.SYNC");
		}

		public function refresh(... args):void {
			LogUtil.debug("Refreshing...");
			_dispatcher.dispatchDelayedEvent(new Event(SharedNotesDispatcher.UPDATE_EVENT));
		}
			
		public function initClient(id:int, serverConnection:ServerConnection, document:String = ""):void {
			_id = id;
			documentShadow = new String(document);
			textArea.text = new String(document);
			initialDocument = new String(document);
			server = serverConnection;
			
			logPrefix = "[Client " + id + "] ";
			
			_dispatcher.dispatchDelayedEvent(new Event(SharedNotesDispatcher.INIT_EVENT));
		}
		
		/**
		 *	There was a problem on the hash calculation when there are special
		 *	characters on the String. It doesn't occur when it's implemented 
		 *	using a ByteArray instead of a String directly.
		 */
		private function calculateChecksum(value:String): String {
			var text:ByteArray = new ByteArray;
			text.writeUTFBytes(value);
			return SHA1.hashBytes(text);
		}

		public function sendMessage():void {
			var messageToSend:Message = new Message(id, _documentName, ServerConnection.connectionType);
			
			var clientText:String = new String(textArea.textFieldText); // a snapshot of the client text
			if (documentShadow != clientText) {
				textArea.editable = false;
				
				messageToSend.patchData = DiffPatch.diff(documentShadow, clientText);
				
				patchHistory.push(messageToSend.patchData);
				
				documentShadow = clientText;

				messageToSend.checksum = calculateChecksum(documentShadow);
				
				textArea.editable = true;
				
				LogUtil.debug(logPrefix + "sending message.\n" + messageToSend);
			}
			
			server.send("m, " + JSON.encode(messageToSend));

			server.pendingResponse = true;

			timeoutTimer.start();
		}
		
		public function receiveMessage(serverMessage:Message): void {
			timeoutTimer.stop();	// we received a response - cancel the time out
			
			LogUtil.debug(logPrefix + "received message.\n" + serverMessage);
			
			if (serverMessage.patchData != "") {
				var result:String = DiffPatch.patch(serverMessage.patchData, documentShadow);
				
				if (calculateChecksum(result) == serverMessage.checksum) {
					documentShadow = result;
					textArea.patch = serverMessage.patchData;
					patchHistory.push(serverMessage.patchData);
				}
				else {
					LogUtil.error("Checksum mismatch");
				}
			}
			
			server.pendingResponse = false;
			_dispatcher.dispatchDelayedEvent(new Event(SharedNotesDispatcher.HANDLE_PATCH_EVENT));
		}
		
		public function getSnapshotAtVersion(initialVersion:int, finalVersion:int, documentSnapshot:String = ""):String {
			if (initialVersion == 0) documentSnapshot = initialDocument;
			
			if (initialVersion < finalVersion) {
				for (var i:int = initialVersion; i < finalVersion; i++) {
					documentSnapshot = DiffPatch.patch(patchHistory[i], documentSnapshot);
				}
			}
			else {
				for (i = finalVersion; i < initialVersion;i++) {
					documentSnapshot = DiffPatch.unpatch(patchHistory[i], documentSnapshot);
				}
			}
			
			return documentSnapshot;
		}
		
		public function startTyping():void {
			testCharacterTimer.start();
		}
		
		public function stopTyping():void {
			testCharacterTimer.stop();
		}
		
		private var testSentence:String = "The quick brown fox jumps over the lazy dog.";
		
		private var testCounter:int = 0;
		
		private function playSentence(event:TimerEvent):void {
			if (textArea.editable) {
				if (testCounter == testSentence.length)  {
					testCounter = 0;
					textArea.tackOnText += "\n";
				} else {
					textArea.tackOnText += testSentence.charAt(testCounter++);
				}
				textArea.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_DOWN));
				textArea.editable = true;
			}
		}
		
		public function isTypingTestRunning():Boolean {
			return testCharacterTimer.running;
		}
		
		private var pendingServerMessage:Message;
		private function startReceive(e:TimerEvent):void {
			receiveMessage(pendingServerMessage);
		}
		
		public function get version():int { return patchHistory.length; }
		
		public function get id():int { return _id; }
		
		public function shutdown():void {
			server.shutdown();
			if (testCharacterTimer) testCharacterTimer.stop();
			if (timeoutTimer) timeoutTimer.stop();
			so.close();
		}
		
		public function get documentName():String {
			return _documentName;
		}
		
		public function get host():String {
			return _host;
		}
	}
}