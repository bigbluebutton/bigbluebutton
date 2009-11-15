package org.bigbluebutton.util.i18n
{
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.EventDispatcher;
	import mx.controls.Alert;
	import mx.events.ResourceEvent;
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;

	public class ResourceUtil extends EventDispatcher
	{
		private static var instance:ResourceUtil = null;
		
		private static var MSG_RESOURCE:String = 'bbbResources';
		
		private var localeChain:Array = [ "en_US", "zh_CN" ];
		
		private var resourceManager:IResourceManager = ResourceManager.getInstance();
		
		public function ResourceUtil(enforcer:SingletonEnforcer)
		{
			if (enforcer == null) {
				throw new Error( "You Can Only Have One ResourceUtil" );
			}
			else {
				// changeLocale(localeChain[0]);
			}
		}
		
		public static function getInstance():ResourceUtil {
			if (instance == null) {
				instance = new ResourceUtil(new SingletonEnforcer);
			}
			return instance;
        }
        
        public function changeLocale(... chain):void{
        	
        	if(chain != null && chain.length > 0)
        	{
        		var localeURI:String = 'locale/' + chain[0] + '_resources.swf';
        		var eventDispatcher:IEventDispatcher = resourceManager.loadResourceModule(localeURI,true);
				localeChain = [chain[0]];
				eventDispatcher.addEventListener(ResourceEvent.COMPLETE, localeChangeComplete);
        	}
        }
        
        private function localeChangeComplete(event:ResourceEvent):void{
        	resourceManager.localeChain = localeChain;
        	update();
        }
        
        public function update():void{
        	dispatchEvent(new Event(Event.CHANGE));
        }
        
        [Bindable("change")]
        public function getString(resourceName:String, parameters:Array = null, locale:String = null):String{
			return resourceManager.getString(MSG_RESOURCE, resourceName, parameters, locale);
		}
	}
}

class SingletonEnforcer{}