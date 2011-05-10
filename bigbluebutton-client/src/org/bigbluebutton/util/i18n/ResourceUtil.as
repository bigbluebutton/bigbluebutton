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
	import com.asfusion.mate.events.Dispatcher;
	
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
		public static var DEFAULT_LANGUAGE:String = "en_US";
		private static var currentLanguage:String = DEFAULT_LANGUAGE;
		private var eventDispatcher:Dispatcher = new Dispatcher();
		
		private var localeChain:Array = new Array();
		private var currentLocalization:Dictionary = new Dictionary();
		
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
			// Add a random string on the query so that we always get an up-to-date config.xml
			var date:Date = new Date();
			LogUtil.debug("Loading " + LOCALES_FILE);
			var _urlLoader:URLLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleComplete);
			_urlLoader.load(new URLRequest(LOCALES_FILE + "?a=" + date.time));
		}
				
		private function handleComplete(e:Event):void{
			parse(new XML(e.target.data));				
		}
		
		public function parse(xml:XML):void{		 	
			var list:XMLList = xml.locale;
			LogUtil.debug("--- Supported locales --- \n" + xml.toString() + "\n --- \n");
			var locale:XML;
						
			for each(locale in list){
				localeChain.push(locale.@code);
			}							
			
			var setLocale:String = ExternalInterface.call("getLanguage");

			for (var i:Number = 0; i<localeChain.length; i++){
				if (setLocale == localeChain[i]){
					changeLocale(setLocale);
					return;
				}
			}
			
			//Locale not found, set default
			changeLocale(DEFAULT_LANGUAGE);			
			
		}
		
		public static function getInstance():ResourceUtil {
			if (instance == null) {
				LogUtil.debug("Setting up supported locales.");
				instance = new ResourceUtil(new SingletonEnforcer);
			} 
			return instance;
        }
        
        public function changeLocale(language:String):void{        	
    		var localeURI:String = 'locale/' + language + '/bbbResources.properties';

			var date:Date = new Date();
			var _urlLoader:URLLoader = new URLLoader();
			_urlLoader.addEventListener(Event.COMPLETE, handleLocaleLoaded);
			_urlLoader.addEventListener(IOErrorEvent.IO_ERROR, handleResourceNotLoaded);
			_urlLoader.load(new URLRequest(localeURI + "?a=" + date.time));
			
			currentLanguage = language;
        }
		
		private function handleLocaleLoaded(e:Event):void{
			var fulltext:String = (e.target.data as String);
			fulltext = com.adobe.utils.StringUtil.remove(fulltext, "\r");
			
			var allStrings:Array = fulltext.split("\n");
			for (var i:Number=0; i<allStrings.length; i++){
				var str:String = allStrings[i] as String;
				
				if (str.charAt(0) != '#'){
					var keyValue:Array = str.split("=");
					var key:String = mx.utils.StringUtil.trim(keyValue[0] as String);
					var value:String = mx.utils.StringUtil.trim(keyValue[1] as String);
					currentLocalization[key] = value;
					trace(key + "=" + value);
				}
			}
			
			trace(currentLocalization['bbb.logout.usercommand']);
			
			update();
		}
        
        /**
         * Defaults to DEFAULT_LANGUAGE when an error is thrown by the ResourceManager 
         * @param event
         */        
        private function handleResourceNotLoaded(event:ResourceEvent):void{
			currentLanguage = DEFAULT_LANGUAGE;
        	update();
        }
        
        public function update():void{
			eventDispatcher.dispatchEvent(new LocaleChangeEvent(LocaleChangeEvent.LOCALE_CHANGED));
        	dispatchEvent(new Event(Event.CHANGE));
        }
        
        [Bindable("change")]
        public function getString(resourceName:String, parameters:Array = null, locale:String = null):String{
			if (!parameters) return currentLocalization[resourceName]; //resourceManager.getString(BBB_RESOURCE_BUNDLE, resourceName, parameters, locale);
			else return insertParameters(currentLocalization[resourceName], parameters);
		}
		
		private function insertParameters(text:String, parameters:Array):String{
			return mx.utils.StringUtil.substitute(text, parameters);
		}
		
		public function getCurrentLanguageCode():String{
			return currentLanguage;
		}
	}
}

class SingletonEnforcer{}