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
		public static const MAIN:String = "C:/tests/playback/Session_Test/";
		public static const PATH:String = MAIN + "lecture.xml";
		public static const SLIDE_FOLDER:String = MAIN + "Slides";
		
		public static var main:String = MAIN;
		public static var path:String = PATH;
		public static var slides:String = SLIDE_FOLDER;
		
		public function XMLProxy(file:String)
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