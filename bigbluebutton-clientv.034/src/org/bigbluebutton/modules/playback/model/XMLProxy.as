package org.bigbluebutton.modules.playback.model
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.controls.Alert;
	
	import org.bigbluebutton.modules.playback.PlaybackFacade;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;
	
	/**
	 * The role of the XMLProxy is to load a specified XML file and dispatch it for use of other classes 
	 * @author dzgonjan
	 * 
	 */	
	public class XMLProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "XMLProxy";
		public static const MAIN:String = "C:/tests/playback/MWtest/session-1/";
		public static const PATH:String = "C:/tests/playback/MWtest/session-1/lecture2.xml";
		public static const SLIDE_FOLDER:String = "C:/tests/playback/MWtest/session-1/slides";
		
		public function XMLProxy(file:String = PATH)
		{
			super(NAME);
			var loader:URLLoader = new URLLoader();
			loader.addEventListener(Event.COMPLETE, handleComplete);
			loader.load(new URLRequest(file));
		}
		
		private function handleComplete(e:Event):void{
			try{
				var xml:XML = new XML(e.target.data);
				sendNotification(PlaybackFacade.XML_READY, xml);
			} catch(e:TypeError){
				Alert.show(e.message);
			}
		}

	}
}