/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.util.i18n
{
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	
	import mx.events.ResourceEvent;
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;

	public class ResourceUtil extends EventDispatcher
	{
		private static var instance:ResourceUtil = null;
		
		private static var MSG_RESOURCE:String = 'bbbResources';
		private static var DEFAULT_LANGUAGE:String = "en_US";
		
		private var localeChain:Array = [ "en_US", "zh_CN", "fr_FR" ];
		
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
				eventDispatcher.addEventListener(ResourceEvent.ERROR, handleResourceNotLoaded);
        	}
        }
        
        private function localeChangeComplete(event:ResourceEvent):void{
        	resourceManager.localeChain = localeChain;
        	update();
        }
        
        /**
         * Defaults to DEFAULT_LANGUAGE when an error is thrown by the ResourceManager 
         * @param event
         */        
        private function handleResourceNotLoaded(event:ResourceEvent):void{
        	resourceManager.localeChain = [DEFAULT_LANGUAGE];
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