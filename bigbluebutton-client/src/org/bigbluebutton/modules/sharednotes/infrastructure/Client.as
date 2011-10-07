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
	import flash.utils.ByteArray;	
	import flash.utils.Timer;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.sharednotes.components.PatchableTextArea;
	import org.bigbluebutton.modules.sharednotes.util.DiffPatch;


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
		
		private var _dispatcher:IEventDispatcher;
		private const STATE_NONE:String = "STATE_NONE";
		private const STATE_INIT:String = "STATE_INIT";
		private const STATE_WAITING_PATCH_APPROVAL:String = "STATE_WAITING_PATCH_APPROVAL";
		private const STATE_UPDATING_REMOTE_USERS:String = "STATE_UPDATING_REMOTE_USERS";
		private const STATE_WAITING_REMOTE_PATCH:String = "STATE_WAITING_REMOTE_PATCH";
		private var _state:String = STATE_NONE;
		private var _delayedEvent:Event = null;
	
		public function Client(textComponent:PatchableTextArea, host:String, documentName:String, refreshTimeout:int, dispatcher:IEventDispatcher) {
			textArea = textComponent;
			_documentName = documentName;
			_host = host;
			_dispatcher = dispatcher;
			
			_dispatcher.addEventListener(ServerConnection.INIT_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + state);
				state = STATE_INIT;
			});
			_dispatcher.addEventListener(ServerConnection.SEND_PATCH_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + state);
				switch(state) {
					case STATE_INIT:
						sendMessage();
						state = STATE_WAITING_PATCH_APPROVAL;
						break;
					case STATE_WAITING_REMOTE_PATCH: // special state that occurs when there's concurrent typing
						delayEvent(e);
						break;
					default:
						LogUtil.debug("Inconsistent state!");
						break;
				}
			});
			_dispatcher.addEventListener(ServerConnection.HANDLE_PATCH_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + state);
				switch(state) {
					case STATE_WAITING_PATCH_APPROVAL:
						_dispatcher.dispatchEvent(new Event(ServerConnection.UPDATE_REMOTE_EVENT));
						state = STATE_UPDATING_REMOTE_USERS;
						break;
					case STATE_WAITING_REMOTE_PATCH:
						state = STATE_INIT;
						break;
					default:
						LogUtil.debug("Inconsistent state!");
						break;
				}
			});
			_dispatcher.addEventListener(ServerConnection.UPDATE_EVENT, function(e:Event):void {
				LogUtil.debug("Received " + e.type + ", current state = " + state);
				switch(state) {
					case STATE_UPDATING_REMOTE_USERS:
						state = STATE_INIT;
						break;
					case STATE_INIT:
						sendMessage();
						state = STATE_WAITING_REMOTE_PATCH;
						break;
					case STATE_WAITING_REMOTE_PATCH: // special state that occurs when there's concurrent typing
					case STATE_WAITING_PATCH_APPROVAL:
						delayEvent(e);
						break;
					default:
						LogUtil.debug("Inconsistent state!");
						break;
				}
			});
			
			timeoutTimer = new Timer(refreshTimeout);
			timeoutTimer.addEventListener(TimerEvent.TIMER, function(e:Event):void {
				timeoutTimer.stop();
				sendMessage();
			});
			
			// used for testing
			testCharacterTimer = new Timer(10);
			testCharacterTimer.addEventListener(TimerEvent.TIMER, playSentence);
			
			server = new HTTPServerConnection(this, dispatcher);
		}
		
		private function delayEvent(e:Event):void {
			LogUtil.debug("Delaying event");
			if (_delayedEvent == null || _delayedEvent.type != ServerConnection.SEND_PATCH_EVENT) 
				_delayedEvent = new Event(e.type);
		}
		
		private function set state(newState:String):void {
			_state = newState;
			if (_state == STATE_INIT && _delayedEvent != null) {
				_dispatcher.dispatchEvent(_delayedEvent);
				_delayedEvent = null;
			}
		}
		
		private function get state():String {
			return _state;
		}
		
		public function initClient(id:int, serverConnection:ServerConnection, document:String = ""):void {
			_id = id;
			documentShadow = new String(document);
			textArea.text = new String(document);
			initialDocument = new String(document);
			server = serverConnection;
			
			logPrefix = "[Client " + id + "] ";
			
			_dispatcher.dispatchEvent(new Event(ServerConnection.INIT_EVENT));
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
			
			if (documentShadow != textArea.textFieldText) {
				textArea.editable = false;
				var clientText:String = new String(textArea.textFieldText); // a snapshot of the client text
				
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
			_dispatcher.dispatchEvent(new Event(ServerConnection.HANDLE_PATCH_EVENT));
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
		}
		
		public function get documentName():String {
			return _documentName;
		}
		
		public function get host():String {
			return _host;
		}
	}
}