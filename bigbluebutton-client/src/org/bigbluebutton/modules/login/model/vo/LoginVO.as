package org.bigbluebutton.modules.login.model.vo
{
	[Bindable]
	public class LoginVO
	{
		public var userid : Number;
		public var name : String;
		public var password: String;
		public var authToken: String;
		public var role : String = Role.VIEWER;	
	}
}