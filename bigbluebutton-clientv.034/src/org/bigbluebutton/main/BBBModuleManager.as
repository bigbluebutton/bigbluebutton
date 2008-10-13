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
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class BBBModuleManager extends Mediator implements IMediator
	{
		public static const NAME:String = "BBBModuleManager";
		public static const FILE_PATH:String = "org/bigbluebutton/common/modules.xml";
		
		public var modules:ArrayList;
		private var urlLoader:URLLoader;
		private var modulesList:Array;
		
		public function BBBModuleManager()
		{
			super(NAME);
			modules = new ArrayList();
			urlLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, handleComplete);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			urlLoader.load(new URLRequest(FILE_PATH));
		}
		
		override public function listNotificationInterests():Array{
			return [
					MainApplicationFacade.START_ALL_MODULES
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case MainApplicationFacade.START_ALL_MODULES:
					for (var i:Number = 0; i<this.modulesList.length ; i++){
						//Alert.show(modulesList[i]);
						loadModule(this.modulesList[i]);
					}
					break;
			}
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
			this.modulesList = new Array();
			for each(item in list){
				this.modulesList.push(item.@swfpath);
			}
		}
		
		private function loadModule(path:String):void{
			
			var loader:ModuleLoader = new ModuleLoader();
			modules.addItem(loader);
			loader.addEventListener(ModuleEvent.READY, moduleReady);
			loader.url = path;
			//Alert.show(loader.url);
			loader.loadModule();
		}
		
		private function moduleReady(e:ModuleEvent):void{
			
			var loader:ModuleLoader = e.target as ModuleLoader;
			var iModule:* = loader.child as ModuleInterface;
			if (iModule != null){
				var bbbModule:BigBlueButtonModule = iModule.getBBBModule();	
				sendNotification(MainApplicationFacade.ADD_MODULE, bbbModule);
			} else{
				Alert.show("Module could not be initialized");
			}
			
			this.modulesList.pop();
			//All modules have started, send notification.
			if (this.modulesList.length == 0){
				sendNotification(MainApplicationFacade.MODULES_STARTED);
			}
		}

	}
}