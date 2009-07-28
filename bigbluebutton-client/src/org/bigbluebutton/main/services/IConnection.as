package org.bigbluebutton.main.services
{
	public interface IConnection
	{
		public function connect(room:String, name:String, role:String, authToken:String):Boolean;
	}
}