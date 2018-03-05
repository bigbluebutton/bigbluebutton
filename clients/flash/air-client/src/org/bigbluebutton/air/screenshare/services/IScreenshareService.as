package org.bigbluebutton.air.screenshare.services
{
	public interface IScreenshareService
	{
		function requestShareToken():void;
		function sharingStartMessage(session: String):void;
		function requestStopSharing(streamId:String):void;
		function requestPauseSharing(streamId:String):void;
		function requestRestartSharing():void;
		function sendClientPongMessage(session: String, timestamp: Number):void;
	}
}