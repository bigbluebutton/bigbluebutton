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
	import org.bigbluebutton.main.events.AppVersionEvent;

	public class ResourceUtil {
		private static var instance:ResourceUtil = null;
        private static var BBB_RESOURCE_BUNDLE:String = 'bbbResources';
        private static var MASTER_LOCALE:String = "en_US";
		private var resourceManager:IResourceManager;
		
		public function ResourceUtil(enforcer:SingletonEnforcer) {
			if (enforcer == null) {
				throw new Error( "You Can Only Have One ResourceUtil" );
			}
			resourceManager = ResourceManager.getInstance();
		}
        
        public static function getInstance():ResourceUtil {
            if (instance == null) {
                instance = new ResourceUtil(new SingletonEnforcer);
            } 
            return instance;
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
		
	}
}

class SingletonEnforcer{}
