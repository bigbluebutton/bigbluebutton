package org.bigbluebutton.air.screenshare.services {
	
	public interface IScreenshareService {
		function setupMessageSenderReceiver():void;
		function checkIfPresenterIsSharingScreen():void;
		function sendClientPongMessage(session:String, timestamp:Number):void;
	}
}
