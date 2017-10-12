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
	import flash.globalization.Collator;
	import flash.globalization.CollatorMode;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import mx.core.FlexGlobals;
	import mx.events.ResourceEvent;
	import mx.resources.IResourceManager;
	import mx.resources.ResourceManager;
	import mx.utils.URLUtil;
	
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.LocaleChangeEvent;
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.core.UsersUtil;
	import org.bigbluebutton.main.events.AppVersionEvent;
	import org.bigbluebutton.main.model.options.LanguageOptions;

	public class ResourceUtil extends EventDispatcher {
		private static const LOGGER:ILogger = getClassLogger(ResourceUtil);

		public static const LOCALES_FILE:String = "client/conf/locales.xml";
		public static const VERSION:String = "0.9.0";
    
		private static var instance:ResourceUtil = null;
		private var inited:Boolean = false;
		
		private static var BBB_RESOURCE_BUNDLE:String = 'bbbResources';
		private static var MASTER_LOCALE:String = "en_US";
		private static var DEFAULT_LOCALE_IDENTIFIER:String = "default";
		
		[Bindable] public var locales:Array = new Array();
		
		//private var eventDispatcher:IEventDispatcher;
		private var resourceManager:IResourceManager;
		private var preferredLocale:String
		private var preferredDirection:String
		private var masterLocaleLoaded:Boolean = false;
		private var masterLocaleLoadedCallback:Function = null;
		
		
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
        		trace("Preferred locale=" + preferredLocale + " is not the same as master locale=" + MASTER_LOCALE);
				loadMasterLocale(MASTER_LOCALE);
			}
			// To improve
			setPreferredLocale({code:preferredLocale, direction:"ltr"});
		}
		
		private function parse(xml:XML):void{		 	
			var list:XMLList = xml.locale;
			var locale:XML;
						
			locales.push({
				code: DEFAULT_LOCALE_IDENTIFIER,
				name: "",
				native: "",
				direction: "ltr"
			});

			for each(locale in list){
				locales.push({
					code: locale.@code.toString(),
					name: locale.@name.toString(),
					native: locale.@native.toString(),
					direction: locale.@direction.valueOf().toString().toLowerCase() == "rtl" ? "rtl" : "ltr"
				});
			}							
		}
		
		private function getDefaultLocale():String {
			return ExternalInterface.call("getLanguage");
		}
		
		private function isPreferredLocaleAvailable(prefLocale:String):Boolean {
			for each(var item:* in locales) {
				if (prefLocale == item.code)
					return true;
			}
			return false;
		}
		
		private function getIndexForLocale(prefLocale:String):int {
			for (var i:Number = 0; i < locales.length; i++) {
				if (prefLocale == locales[i].code)
					return i;
			}
			return -1;
		}
		
		public function setPreferredLocale(locale:Object):void {
			var localeCode : String = locale.code;
			if (localeCode == DEFAULT_LOCALE_IDENTIFIER) {
				localeCode = getDefaultLocale();
			}

			if (isPreferredLocaleAvailable(localeCode)) {
				preferredLocale = localeCode;
			}else{
				preferredLocale = MASTER_LOCALE;
			}

			preferredDirection = locale.direction;
			changeLocale(preferredLocale);
		}
		
		private function localesCompareFunction(a:Object, b:Object):int {
			var sorter:Collator = new Collator(preferredLocale, CollatorMode.SORTING);
			// position the "Default language" option at the top of the list
			if (a.code == DEFAULT_LOCALE_IDENTIFIER) {
				return -1;
			}
			if (b.code == DEFAULT_LOCALE_IDENTIFIER) {
				return 1;
			}
			return sorter.compare(a.name, b.name);
		}

		private function reloadLocaleNames():void {
			locales[0].name = locales[0].native = ResourceUtil.getInstance().getString("bbb.langSelector." + locales[0].code, null, getDefaultLocale());
			locales.sort(localesCompareFunction);
		}

		private function loadMasterLocale(locale:String):void {
      trace("Loading master locale=" + locale);
			/**
			 *  http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/mx/resources/IResourceManager.html#localeChain
			 *  Always load the default language, so if the chosen language 
			 *  doesn't provide a resource, the default language resource is used
			 */
			var dispatcher:IEventDispatcher = loadResource(locale);
			dispatcher.addEventListener(ResourceEvent.COMPLETE, onMasterLocaleLoaded);
		}
		
		private function onMasterLocaleLoaded(event:ResourceEvent):void {
			trace("Master locale is loaded");
			masterLocaleLoaded = true;
			if (masterLocaleLoadedCallback != null) {
				trace("Calling callback to load a second language");
				masterLocaleLoadedCallback();
			}
		}

		private function loadResource(language:String):IEventDispatcher {
			// Add a random string on the query so that we don't get a cached version.
			
			var date:Date = new Date();
			var localeURI:String = buildRequestURL() + 'client/locale/' + language + '_resources.swf?a=' + date.time;
      		trace("Loading locale " +  localeURI);
			return resourceManager.loadResourceModule( localeURI, false);
		}		
		
		public static function getInstance():ResourceUtil {
			if (instance == null) {
				instance = new ResourceUtil(new SingletonEnforcer);
			} 
			return instance;
        }
        
		private function changeLocaleHelper(locale:String):void {
      		var eventDispatcher:IEventDispatcher = loadResource(locale);
			eventDispatcher.addEventListener(ResourceEvent.COMPLETE, localeChangeComplete);
			eventDispatcher.addEventListener(ResourceEvent.ERROR, handleResourceNotLoaded);
		}

		public function changeLocale(locale:String):void {
			if (masterLocaleLoaded || locale == MASTER_LOCALE) {
				trace("Loading immediately " + locale);
				changeLocaleHelper(locale);
			} else {
        		trace("Registering callback to load " + locale + " later");
				masterLocaleLoadedCallback = function():void {
					changeLocaleHelper(locale);
				}
			}
		}
		
		private function localeChangeComplete(event:ResourceEvent):void {
			// Set the preferred locale and master as backup.
			if (preferredLocale != MASTER_LOCALE) {
				resourceManager.localeChain = [preferredLocale, MASTER_LOCALE];
			} else {
				if (preferredLocale != MASTER_LOCALE) {
                    var logData:Object = UsersUtil.initLogData();
                    logData.tags = ["locale"];
                    logData.message = "Failed to load locale = " + preferredLocale;
                    trace(JSON.stringify(logData));
				}
				masterLocaleLoaded = true;
				resourceManager.localeChain = [MASTER_LOCALE];
				preferredLocale = MASTER_LOCALE;
			}
			
			update();
		}
		
		private function sendAppAndLocaleVersions():void {
      		trace("Sending locale version");
			var dispatcher:Dispatcher = new Dispatcher();
			var versionEvent:AppVersionEvent = new AppVersionEvent();
			versionEvent.configLocaleVersion = false;
			dispatcher.dispatchEvent(versionEvent);			
		}

		/**
		 * Defaults to DEFAULT_LANGUAGE when an error is thrown by the ResourceManager
		 * @param event
		 */
		private function handleResourceNotLoaded(event:ResourceEvent):void {
			trace("Resource locale [" + preferredLocale + "] could not be loaded.");
			resourceManager.localeChain = [MASTER_LOCALE];
			preferredLocale = MASTER_LOCALE;
			update();
		}
		
		public function update():void{
			reloadLocaleNames();
      		sendAppAndLocaleVersions();
			var dispatcher:Dispatcher = new Dispatcher;
			dispatcher.dispatchEvent(new LocaleChangeEvent(LocaleChangeEvent.LOCALE_CHANGED));
			dispatchEvent(new Event(Event.CHANGE));
		}
		
		[Bindable("change")]
		public function getString(resourceName:String, parameters:Array = null, locale:String = null):String{
			/**
			 * @fixme: to be reviewed when all locales from transifex are updated (gtriki feb 7, 2017)
			 * Get the translated string from the current locale. If empty, get the string from the master
			 * locale. Locale chaining isn't working because mygengo actually puts the key and empty value
			 * for untranslated strings into the locale file. So, when Flash does a lookup, it will see that
			 * the key is available in the locale and thus not bother falling back to the master locale.
			 *    (ralam dec 15, 2011).
			 */
			if (resourceManager.getObject(BBB_RESOURCE_BUNDLE, resourceName, locale) == undefined) {
				locale = MASTER_LOCALE;
			}

			var localeTxt:String = resourceManager.getString(BBB_RESOURCE_BUNDLE, resourceName, parameters, locale);
			if (locale != MASTER_LOCALE && StringUtils.isEmpty(localeTxt)) {
				localeTxt = resourceManager.getString(BBB_RESOURCE_BUNDLE, resourceName, parameters, MASTER_LOCALE);
			}
			return localeTxt;
		}
		
		public function getCurrentLanguageCode():String{
			return preferredLocale;
		}
		
		public function getCurrentLanguageDirection():String{
			return preferredDirection;
		}
				
		public function getCurrentLanguage():Object {
			return locales[getCurrentLanguageIndex()];
		}

		public function getCurrentLanguageIndex():int {
			return getIndexForLocale(preferredLocale);
		}
		
		public function isRTLEnabled() : Boolean {
			var languageOptions : LanguageOptions = Options.getOptions(LanguageOptions) as LanguageOptions;
			return languageOptions.rtlEnabled;
		}
	}
}

class SingletonEnforcer{}
