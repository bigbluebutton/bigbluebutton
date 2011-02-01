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
	import flash.events.IEventDispatcher;
	import flash.events.TimerEvent;
	import flash.utils.Timer;
	
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
		private var documentCheckTimer:Timer;	// timer to check for changes in the document
		private var timeoutTimer:Timer = new Timer(5000); // setting the timeout for server requests to 5 seconds
		
		public static var documentName:String = "";
		
	
		public function Client(textComponent:PatchableTextArea, dispatcher:IEventDispatcher) {
			textArea = textComponent;
			server = new HTTPServerConnection(this, dispatcher);
		}
		
		public function initClient(id:int, serverConnection:ServerConnection, document:String = ""):void {
			_id = id;
			documentShadow = new String(document);
			textArea.text = new String(document);
			initialDocument = new String(document);
			server = serverConnection;
			
			logPrefix = "[Client " + id + "] ";
			initDocumentCheckTimer();
			
			timeoutTimer.addEventListener(TimerEvent.TIMER, function(e:Event):void {
				timeoutTimer.stop();
				sendMessage();
			});
			
			// used for testing
			testCharacterTimer = new Timer(10);
			testCharacterTimer.addEventListener(TimerEvent.TIMER, playSentence);
		}
		
		private function initDocumentCheckTimer():void {
			documentCheckTimer = new Timer(500);
			documentCheckTimer.addEventListener(TimerEvent.TIMER, documentCheckEventHandler);
			documentCheckTimer.start();
		}
		
		private function documentCheckEventHandler(e:TimerEvent):void {
			if (!server.pendingResponse) {
				sendMessage();
			}
		}

		public function sendMessage():void {
			var messageToSend:Message = new Message(id, documentName, ServerConnection.connectionType);
			
			if (documentShadow != textArea.textFieldText) {
				trace("****** SENDING MESSAGE *******");
				
				textArea.editable = false;
				var clientText:String = new String(textArea.textFieldText); // a snapshot of the client text
				
				messageToSend.patchData = DiffPatch.diff(documentShadow, clientText);
				
				patchHistory.push(messageToSend.patchData);
				
				documentShadow = clientText;

				messageToSend.checksum = SHA1.hash(documentShadow);
				
				textArea.editable = true;
				
				trace(logPrefix + "sending " + messageToSend);
			}
			
			server.send("m, " + JSON.encode(messageToSend));

			timeoutTimer.start();
		}
		
		public function receiveMessage(serverMessage:Message): void {
			timeoutTimer.stop();	// we received a response - cancel the time out
			
			trace(logPrefix + "received message.\nMessage: " + serverMessage);
			
			if (serverMessage.patchData != "") {
				var result:String = DiffPatch.patch(serverMessage.patchData, documentShadow);
				
				if (SHA1.hash(result) == serverMessage.checksum) {
					documentShadow = result;
					textArea.patch = serverMessage.patchData;
					patchHistory.push(serverMessage.patchData);
				}
				else {
					throw new Error("Checksum mismatch");
				}
			}
			
			server.pendingResponse = false;
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
				}
				else {
					textArea.tackOnText += testSentence.charAt(testCounter++);
				}
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
		
		private function timeoutHandler(event:TimerEvent):void {
			sendMessage();
		}
		
		public function get version():int { return patchHistory.length; }
		
		public function get id():int { return _id; }
		
		public function shutdown():void {
			server.shutdown();
			if (testCharacterTimer) testCharacterTimer.stop();
			if (documentCheckTimer) documentCheckTimer.stop();
			if (timeoutTimer) timeoutTimer.stop();
		}
	}
}