package org.bigbluebutton.main
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.collections.ArrayList;
	import mx.controls.Alert;
	import mx.events.ModuleEvent;
	import mx.modules.ModuleLoader;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.ModuleInterface;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class BBBModuleManager extends Mediator implements IMediator
	{
		public static const NAME:String = "BBBModuleManager";
		public static const FILE_PATH:String = "org/bigbluebutton/common/modules.xml";
		
		public var modules:ArrayList;
		
		public function BBBModuleManager()
		{
			super(NAME);
			modules = new ArrayList();
			var loader:URLLoader = new URLLoader();
			loader.addEventListener(Event.COMPLETE, handleComplete);
			loader.load(new URLRequest(FILE_PATH));
		}
		
		private function handleComplete(e:Event):void{
			try{
				parse(new XML(e.target.data));
			} catch(error:TypeError){
				Alert.show(error.message);
			}
		}
		
		private function parse(xml:XML):void{
			var list:XMLList = xml.module;
			var item:XML;
			for each(item in list){
				loadModule(item.@swfpath);
			}
		}
		
		private function loadModule(path:String):void{
			
			var loader:ModuleLoader = new ModuleLoader();
			loader.addEventListener(ModuleEvent.READY, moduleReady);
			loader.url = path;
			loader.loadModule();
		}
		
		private function moduleReady(e:ModuleEvent):void{
			
			var loader:ModuleLoader = e.target as ModuleLoader;
			var iModule:* = loader.child as ModuleInterface;
			if (iModule != null){
				var bbbModule:BigBlueButtonModule = iModule.getBBBModule();	
				sendNotification(MainApplicationFacade.ADD_MODULE, bbbModule);
			}
		}

	}
}