package org.bigbluebutton.lib.user.services {
	
	public interface IUsersService {
		function setupMessageSenderReceiver():void;
		function kickUser(userId:String):void;
		function queryForParticipants():void;
		function assignPresenter(userId:String, name:String):void;
		function emojiStatus(userId:String, status:String):void;
		function clearUserStatus(userId:String):void
		function addStream(userId:String, streamName:String):void;
		function removeStream(userId:String, streamName:String):void;
		function queryForRecordingStatus():void;
		function changeRecordingStatus(userId:String, recording:Boolean):void;
		function muteAllUsers(mute:Boolean):void;
		function muteAllUsersExceptPresenter(mute:Boolean):void;
		function ejectUser(userId:String):void;
		function getRoomMuteState():void;
		function getRoomLockState():void;
		function setAllUsersLock(lock:Boolean, except:Array = null):void;
		function setUserLock(internalUserId:String, lock:Boolean):void;
		function getLockSettings():void;
		function saveLockSettings(newLockSettings:Object):void;
		function validateToken():void;
		function joinMeeting():void;
	}
}
