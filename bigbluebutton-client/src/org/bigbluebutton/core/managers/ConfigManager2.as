package org.bigbluebutton.core.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.core.FlexGlobals;
	import mx.utils.URLUtil;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.EventBroadcaster;
	import org.bigbluebutton.core.model.Config;
	
	public class ConfigManager2 extends EventDispatcher {
    public static const CONFIG_XML:String = "client/conf/config.xml";
    
		private var _config:Config = null;
				
		public function loadConfig():void {
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			var date:Date = new Date();
      var localeReqURL:String = buildRequestURL() + "?a=" + date.time;
			urlLoader.load(new URLRequest(localeReqURL));			
		}		
		
    private function buildRequestURL():String {
      var swfURL:String = FlexGlobals.topLevelApplication.url;
      var protocol:String = URLUtil.getProtocol(swfURL);
      var serverName:String = URLUtil.getServerNameWithPort(swfURL);        
      return protocol + "://" + serverName + "/" + CONFIG_XML;
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