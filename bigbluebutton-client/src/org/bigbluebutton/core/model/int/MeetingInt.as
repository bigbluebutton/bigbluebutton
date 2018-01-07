package org.bigbluebutton.core.model.int
{
	internal class MeetingInt
	{
		var name:String;
		var internalId:String;
		var externalId:String;
		var isBreakout:Boolean;
		var defaultAvatarUrl:String;
		var voiceConference:String;
		var dialNumber:String;
		var recorded:Boolean;
		var defaultLayout:String;
		var welcomeMessage:String;
		var modOnlyMessage:String;
		var allowStartStopRecording:Boolean;
		var webcamsOnlyForModerator:Boolean;
		var metadata:Object = null;
		
		function MeetingInt()
		{
		}
	}
}