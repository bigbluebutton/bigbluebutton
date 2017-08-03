package org.bigbluebutton.modules.users.views.model
{
	public class User
	{
		[Bindable] public var me:Boolean = false;
		[Bindable] public var userID:String = "UNKNOWN USER";
		[Bindable] public var externUserID:String = "UNKNOWN USER";
		[Bindable] public var name:String;
		[Bindable] public var talking:Boolean = false;
		[Bindable] public var phoneUser:Boolean = false;
		[Bindable] public var listenOnly:Boolean = false;
		
		[Bindable] public var disableMyCam:Boolean = false;
		[Bindable] public var disableMyMic:Boolean = false;
		[Bindable] public var disableMyPrivateChat:Boolean = false;
		[Bindable] public var disableMyPublicChat:Boolean = false;
		[Bindable] public var lockedLayout:Boolean = false;
		[Bindable] public var avatarURL:String="";
		
		[Bindable] public var guest:Boolean = false;
		[Bindable] public var waitingForAcceptance:Boolean = false;
		
		public function User()
		{
		}
	}
}