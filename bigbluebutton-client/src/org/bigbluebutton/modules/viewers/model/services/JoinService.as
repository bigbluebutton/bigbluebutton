package org.bigbluebutton.modules.viewers.model.services
{
	import flash.events.*;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLRequestMethod;
	import flash.net.URLVariables;
	        	
	public class JoinService
	{  
		private var request:URLRequest = new URLRequest();
		private var vars:URLVariables = new URLVariables();
		
		private var urlLoader:URLLoader;
		private var _resultListener:Function;
		
		public function JoinService()
		{
		}
		
		public function load(url:String) : void
		{
			LogUtil.debug("JoinService:load(...) " + url);
			            
            request = new URLRequest(url);
            request.method = URLRequestMethod.GET;		
            
            urlLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);	
            urlLoader.load(request);	
		}

		public function addJoinResultListener(listener:Function):void {
			_resultListener = listener;
		}
		
		private function handleComplete(e:Event):void{
			
			var xml:XML = new XML(e.target.data)
			LogUtil.debug("Loading complete: " + xml);
			var returncode:String = xml.returncode;
			if (returncode == 'FAILED') {
				LogUtil.debug("Result = " + returncode + " " + xml.message);
				_resultListener(false, {message:xml.message});
			} else if (returncode == 'SUCCESS') {
				LogUtil.debug(xml.returncode + " " + xml.fullname + " " + xml.conference + " " + xml.role
					+ " " + xml.room);
				var user:Object = {username:xml.fullname, conference:xml.conference, 
										role:xml.role, room:xml.room, authToken:xml.room};
				_resultListener(true, user);
			}
				
		}
	}
}