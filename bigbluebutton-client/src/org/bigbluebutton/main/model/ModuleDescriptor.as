/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.main.model
{
	import flash.events.Event;
	import flash.events.ProgressEvent;
	
	import mx.modules.ModuleLoader;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.main.MainApplicationConstants;
	
	public class ModuleDescriptor
	{
		private var _attributes:Object;
		private var _loader:ModuleLoader;
		private var _module:IBigBlueButtonModule;
		private var _loaded:Boolean = false;
		private var _started:Boolean = false;
		private var _connected:Boolean = false;
				
		private var callbackHandler:Function;
		
		public function ModuleDescriptor(attributes:XML)
		{
			_attributes = new Object();
			_loader = new ModuleLoader();
			
			parseAttributes(attributes);			
		}

		public function addAttribute(attribute:String, value:Object):void {
			_attributes[attribute] = value;
		}
		
		public function getAttribute(name:String):Object {
			return _attributes[name];
		}
		
		public function get attributes():Object {
			return _attributes;
		}
		
		public function get module():IBigBlueButtonModule {
			return _module;
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function set started(value:Boolean):void {
			_started = value;
		}
		
		private function parseAttributes(item:XML):void {
			var attNamesList:XMLList = item.@*;

			for (var i:int = 0; i < attNamesList.length(); i++)
			{ 
			    var attName:String = attNamesList[i].name();
			    var attValue:String = item.attribute(attName);
			    _attributes[attName] = attValue;
			} 
		}
		
		
		public function load(resultHandler:Function):void {
			callbackHandler = resultHandler;
//			loader.addEventListener("urlChanged", resultHandler);
//			loader.addEventListener("loading", resultHandler);
			_loader.addEventListener("progress", onLoadProgress);
//			loader.addEventListener("setup", resultHandler);
			_loader.addEventListener("ready", onReady);
//			loader.addEventListener("error", resultHandler);
//			loader.addEventListener("unload", resultHandler);
			_loader.url = _attributes.url;
			_loader.loadModule();
		}
		
		public function unload():void {
			_loader.url = "";
		}

		private function onReady(event:Event):void {
			LogUtil.debug("Module onReady Event");
			var modLoader:ModuleLoader = event.target as ModuleLoader;
			_module = modLoader.child as IBigBlueButtonModule;
			if (_module != null) {
				LogUtil.debug("Module " + _attributes.name + " has been loaded");
				_loaded = true;
				callbackHandler(MainApplicationConstants.MODULE_LOAD_READY, _attributes.name);
			} else {
				LogUtil.error("Module loaded is null.");
			}
			
		}	

		private function onLoadProgress(e:ProgressEvent):void {
			callbackHandler(MainApplicationConstants.MODULE_LOAD_PROGRESS, 
					_attributes.name, Math.round((e.bytesLoaded/e.bytesTotal) * 100));
		}	
		
		public function useProtocol(protocol:String):void {
			_attributes.uri = _attributes.uri.replace(/rtmp:/gi, protocol + ":");
			LogUtil.debug(_attributes.name + " uri = " + _attributes.uri);
		}
		
/*
		private function onUrlChanged(event:Event):void {
			LogUtil.debug("Module onUrlChanged Event");
			callbackHandler(event);
		}
			
		private function onLoading(event:Event):void {
			LogUtil.debug("Module onLoading Event");
			callbackHandler(event);
		}
			
		private function onProgress(event:Event):void {
			LogUtil.debug("Module onProgress Event");
			callbackHandler(event);
		}			

		private function onSetup(event:Event):void {
			LogUtil.debug("Module onSetup Event");
			callbackHandler(event);
		}	



		private function onError(event:Event):void {
			LogUtil.debug("Module onError Event");
			callbackHandler(event);
		}

		private function onUnload(event:Event):void {
			LogUtil.debug("Module onUnload Event");
			callbackHandler(event);
		}		
*/
	}
}