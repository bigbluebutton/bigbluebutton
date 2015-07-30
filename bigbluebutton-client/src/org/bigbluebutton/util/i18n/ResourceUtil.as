/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
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
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.IEventDispatcher;
	import flash.external.ExternalInterface;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.core.FlexGlobals;
	import mx.events.ResourceEvent;
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;
	import mx.utils.URLUtil;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.LocaleChangeEvent;
	import org.bigbluebutton.main.events.AppVersionEvent;

	public class ResourceUtil extends EventDispatcher {
		private static const LOGGER:ILogger = getClassLogger(ResourceUtil);

		public static const LOCALES_FILE:String = "client/conf/locales.xml";
		public static const VERSION:String = "0.9.0";
    
		private static var instance:ResourceUtil = null;
		private var inited:Boolean = false;
		
		private static var BBB_RESOURCE_BUNDLE:String = 'bbbResources';
		private static var MASTER_LOCALE:String = "en_US";
		
		[Bindable] public var localeCodes:Array = new Array();
		[Bindable] public var localeNames:Array = new Array();
		[Bindable] public var localeIndex:Number;
		
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
			
			var _urlLoader:URLLoader = new URLLoader();     
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);
      
      		var localeReqURL:String = buildRequestURL() + LOCALES_FILE + "?a=" + date.time;
	  		LOGGER.debug("Loading {0}", [localeReqURL]);
			_urlLoader.load(new URLRequest(localeReqURL));
		}
		
    private function buildRequestURL():String {
      var swfURL:String = FlexGlobals.topLevelApplication.url;
      var protocol:String = URLUtil.getProtocol(swfURL);
      var serverName:String = URLUtil.getServerNameWithPort(swfURL);        
      return protocol + "://" + serverName + "/";
    }
    
		private function handleComplete(e:Event):void{
			parse(new XML(e.target.data));		
									
			preferredLocale = getDefaultLocale();
			if (preferredLocale != MASTER_LOCALE) {
				loadMasterLocale(MASTER_LOCALE);
			}
			setPreferredLocale(preferredLocale);
		}
		
		private function parse(xml:XML):void{		 	
			var list:XMLList = xml.locale;
			LOGGER.debug("--- Supported locales --- \n{0}\n --- \n", [xml.toString()]);
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
		
		private function getIndexForLocale(prefLocale:String):int {
			for (var i:Number = 0; i < localeCodes.length; i++){
				if (prefLocale == localeCodes[i]) 
					return i;
			}
			return -1;
		}
		
		public function getPreferredLocaleName():String {
			return localeNames[localeIndex];
		}
		
		public function setPreferredLocale(locale:String):void {
			LOGGER.debug("Setting up preferred locale {0}", [locale]);
			if (isPreferredLocaleAvailable(locale)) {
				LOGGER.debug("The locale {0} is available", [locale]);
				preferredLocale = locale;
			}else{
				LOGGER.debug("The locale {0} isn't available. Default will be: {1}", [preferredLocale, MASTER_LOCALE]);
				preferredLocale = MASTER_LOCALE;
			}
			localeIndex = getIndexForLocale(preferredLocale);
			LOGGER.debug("Setting up preferred locale index {0}", [localeIndex]);
			changeLocale(preferredLocale);
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
			// Add a random string on the query so that we don't get a cached version.
			
			var date:Date = new Date();
			var localeURI:String = buildRequestURL() + 'client/locale/' + language + '_resources.swf?a=' + date.time;
			LOGGER.debug("Loading locale at [ {0} ]", [localeURI]);
			return resourceManager.loadResourceModule( localeURI, false);
		}		
		
		public static function getInstance():ResourceUtil {
			if (instance == null) {
				LOGGER.debug("Setting up supported locales.");
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
				LOGGER.debug("Loaded locale [{0}] but setting [{1}] as fallback", [preferredLocale, MASTER_LOCALE]);
				resourceManager.localeChain = [preferredLocale, MASTER_LOCALE];
				localeIndex = getIndexForLocale(preferredLocale);
			} else {
				if (preferredLocale != MASTER_LOCALE) {
					LOGGER.debug("Failed to load locale [{0}].", [preferredLocale]);
				}
				LOGGER.debug("Using [{0}] locale.", [MASTER_LOCALE]);
				resourceManager.localeChain = [MASTER_LOCALE];
				preferredLocale = MASTER_LOCALE;
				localeIndex = getIndexForLocale(preferredLocale);
			}
			sendAppAndLocaleVersions();
			update();
		}
		
		private function sendAppAndLocaleVersions():void {
			var dispatcher:Dispatcher = new Dispatcher();
			var versionEvent:AppVersionEvent = new AppVersionEvent();
			versionEvent.configLocaleVersion = false;
			dispatcher.dispatchEvent(versionEvent);			
		}		
		
		/**
		 * Defaults to DEFAULT_LANGUAGE when an error is thrown by the ResourceManager 
		 * @param event
		 */        
		private function handleResourceNotLoaded(event:ResourceEvent):void{
			LOGGER.warn("Resource locale [{0}] could not be loaded.", [preferredLocale]);
			resourceManager.localeChain = [MASTER_LOCALE];
			preferredLocale = MASTER_LOCALE;
			localeIndex = getIndexForLocale(preferredLocale);
			update();
		}
		
		public function update():void{
			var dispatcher:Dispatcher = new Dispatcher;
			dispatcher.dispatchEvent(new LocaleChangeEvent(LocaleChangeEvent.LOCALE_CHANGED));
			dispatchEvent(new Event(Event.CHANGE));
		}
		
		[Bindable("change")]
		public function getString(resourceName:String, parameters:Array = null, locale:String = null):String{
			/**
			 * Get the translated string from the current locale. If empty, get the string from the master
			 * locale. Locale chaining isn't working because mygengo actually puts the key and empty value
			 * for untranslated strings into the locale file. So, when Flash does a lookup, it will see that
			 * the key is available in the locale and thus not bother falling back to the master locale.
			 *    (ralam dec 15, 2011).
			 */
			var localeTxt:String = resourceManager.getString(BBB_RESOURCE_BUNDLE, resourceName, parameters, null);
			if ((localeTxt == "") || (localeTxt == null)) {
				localeTxt = resourceManager.getString(BBB_RESOURCE_BUNDLE, resourceName, parameters, MASTER_LOCALE);
			}
			return localeTxt;
		}
		
		public function getCurrentLanguageCode():String{
			return preferredLocale;
		}
				
		public function getLocaleCodeForIndex(index:int):String {
			return localeCodes[index];
		}
	}
}

class SingletonEnforcer{}
