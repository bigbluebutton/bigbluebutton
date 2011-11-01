/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
package org.bigbluebutton.util.i18n
{
	import com.adobe.utils.StringUtil;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.utils.Dictionary;
	
	import mx.controls.Alert;
	import mx.events.ResourceEvent;
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;
	import mx.utils.StringUtil;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.LocaleChangeEvent;

	public class ResourceUtil extends EventDispatcher {
		private static var instance:ResourceUtil = null;
		public static const LOCALES_FILE:String = "conf/locales.xml";
		public static const VERSION:String = "0.8-PRE";
		private var inited:Boolean = false;
		
		private static var BBB_RESOURCE_BUNDLE:String = 'bbbResources';
		private static var MASTER_LOCALE:String = "en_US";
		
		[Bindable]
		public var localeCodes:Array = new Array();
		[Bindable]
		public var localeNames:Array = new Array();
		
		private var eventDispatcher:IEventDispatcher;
		private var resourceManager:IResourceManager;
		private var preferredLocale:String
		
		public function ResourceUtil(enforcer:SingletonEnforcer) {
			if (enforcer == null) {
				throw new Error( "You Can Only Have One ResourceUtil" );
			}
			initialize();
		}
		
		private function isInited():Boolean {
			return inited;
		}
		
		public function initialize():void {
			resourceManager = ResourceManager.getInstance();
			
			// Add a random string on the query so that we always get an up-to-date config.xml
			var date:Date = new Date();
			LogUtil.debug("Loading " + LOCALES_FILE);
			var _urlLoader:URLLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			_urlLoader.load(new URLRequest(LOCALES_FILE + "?a=" + date.time));
		}
				
		private function handleComplete(e:Event):void{
			parse(new XML(e.target.data));		
			
			loadMasterLocale(MASTER_LOCALE);			
			preferredLocale = getDefaultLocale();
			setPreferredLocale(preferredLocale);
		}
		
		private function parse(xml:XML):void{		 	
			var list:XMLList = xml.locale;
			LogUtil.debug("--- Supported locales --- \n" + xml.toString() + "\n --- \n");
			var locale:XML;
						
			for each(locale in list){
				localeCodes.push(locale.@code);
				localeNames.push(locale.@name);
			}							
		}
		
		private function getDefaultLocale():String {
			return ExternalInterface.call("getLanguage");
		}
		
		private function isPreferredLocaleAvailable(prefLocale:String):Boolean {
			for (var i:Number = 0; i < localeCodes.length; i++){
				if (prefLocale == localeCodes[i]) 
					return true;
			}
			return false;
		}
		
		public function setPreferredLocale(locale:String):void {
			LogUtil.debug("Setting up preferred locale " + locale);
			preferredLocale = locale;
			if (isPreferredLocaleAvailable(preferredLocale)) {				
				changeLocale(preferredLocale);				
			}
		}
		
		private function loadMasterLocale(locale:String):void {					
			/**
			 *  http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/mx/resources/IResourceManager.html#localeChain
			 *  Always load the default language, so if the chosen language 
			 *  doesn't provide a resource, the default language resource is used
			 */
			loadResource(locale);					
		}
		
		private function loadResource(language:String):IEventDispatcher {
			var localeURI:String = 'locale/' + language + '_resources.swf';
			return resourceManager.loadResourceModule(localeURI, false);
		}		
		
		public static function getInstance():ResourceUtil {
			if (instance == null) {
				LogUtil.debug("Setting up supported locales.");
				instance = new ResourceUtil(new SingletonEnforcer);
			} 
			return instance;
        }
        
		public function changeLocale(locale:String):void{        	
			eventDispatcher = loadResource(locale);
			eventDispatcher.addEventListener(ResourceEvent.COMPLETE, localeChangeComplete);
			eventDispatcher.addEventListener(ResourceEvent.ERROR, handleResourceNotLoaded);
		}
		
		private function localeChangeComplete(event:ResourceEvent):void {
			// Set the preferred locale and master as backup.
			if (preferredLocale != MASTER_LOCALE) {
				resourceManager.localeChain = [preferredLocale, MASTER_LOCALE];
			} else {
				resourceManager.localeChain = [MASTER_LOCALE];
			}
			
			update();
		}
		
		/**
		 * Defaults to DEFAULT_LANGUAGE when an error is thrown by the ResourceManager 
		 * @param event
		 */        
		private function handleResourceNotLoaded(event:ResourceEvent):void{
			resourceManager.localeChain = [MASTER_LOCALE];
			update();
		}
		
		public function update():void{
			dispatchEvent(new Event(Event.CHANGE));
		}
		
		[Bindable("change")]
		public function getString(resourceName:String, parameters:Array = null, locale:String = null):String{
			return resourceManager.getString(BBB_RESOURCE_BUNDLE, resourceName, parameters, locale);
		}
		
		public function getCurrentLanguageCode():String{
			return preferredLocale;
		}
	}
}

class SingletonEnforcer{}
