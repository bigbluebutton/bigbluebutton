package org.bigbluebutton.modules.chat.model.business
{
	public class UserVO
	{
		public var username:String;
		public var userid:String;
		
		public function UserVO(username:String, userid:String)
		{
			this.userid = userid;
			this.username = username;
		}

	}
}