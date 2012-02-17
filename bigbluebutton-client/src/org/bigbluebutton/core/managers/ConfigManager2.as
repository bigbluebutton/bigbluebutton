package org.bigbluebutton.core.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.EventBroadcaster;
	import org.bigbluebutton.core.model.Config;
	
	public class ConfigManager2 extends EventDispatcher {
		private var _config:Config = null;
				
		public function loadConfig():void {
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
			urlLoader.load(new URLRequest("conf/config.xml" + "?a=" + date.time));			
		}		
		
		private function handleComplete(e:Event):void{
			_config = new Config(new XML(e.target.data));
			 EventBroadcaster.getInstance().dispatchEvent(new Event("configLoadedEvent", true));	
		//	 var dispatcher:Dispatcher = new Dispatcher();
		//	 LogUtil.debug("*** Sending config loaded event.");
		//	 dispatcher.dispatchEvent(new Event("configLoadedEvent", true));
		}
		
		public function get config():Config {
			return _config;
		}
	}
}