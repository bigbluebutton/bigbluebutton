package org.bigbluebutton.main.managers
{
	import flash.net.SharedObject;
	
	public class ConnectionManager
	{
		public function ConnectionManager()
		{
		}
		
		public function connect(room:String, name:String, role:String, authToken:String):void {
			
		}
		
		public function getSharedObject(name:String):SharedObject {
			return null;
		}
		
		public function connectSharedObject(so:SharedObject):void {
			
		}
		
		public function call(command:String, responder:Responder, ... arguments):void {
			
		}
	}
}