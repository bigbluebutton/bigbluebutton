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
package org.bigbluebutton.core.model
{
	import flash.events.Event;
	import flash.events.IEventDispatcher;
	import flash.events.ProgressEvent;
	import flash.system.ApplicationDomain;
	import flash.utils.Dictionary;
	
	import mx.collections.ArrayCollection;
	import mx.controls.Alert;
	import mx.core.IFlexModuleFactory;
	import mx.events.ModuleEvent;
	import mx.modules.ModuleLoader;
	import mx.utils.StringUtil;
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.services.ModuleLoaderService;
	import org.bigbluebutton.main.model.ConferenceParameters;
	import org.bigbluebutton.main.model.modules.BigBlueButtonModuleLoader;
	
	public class ModuleDescriptor
	{
        private var _module:IBigBlueButtonModule;
        private var _dispatcher:IEventDispatcher;
        private var _attributes:Object = new Object();
        private var _unresolvedDependencies:ArrayCollection  = new ArrayCollection();
        
        public var resolved:Boolean = false;
        public var loaded:Boolean = false;
        
        public function set dispatcher(dispatcher:IEventDispatcher):void {
            _dispatcher = dispatcher;
        }
        
        public function get name():String{
            return _attributes["name"] as String;
        }
        
        public function set module(m:IBigBlueButtonModule):void {
            _module = m;
        }
        
        public function get module():IBigBlueButtonModule {
            return _module;
        }
        
        public function set attributes(attr:Object):void {
            _attributes = attr;
        }
        
        public function get attributes():Object {
            return _attributes;
        }
        
        public function set unresolvedDependencies(deps:ArrayCollection):void {
            _unresolvedDependencies = deps;
        }
        
        public function get unresolvedDependencies():ArrayCollection {
            return _unresolvedDependencies;
        }
        
        public function removeDependency(module:String):void{
            for (var i:int = 0; i < _unresolvedDependencies.length; i++){
                if (_unresolvedDependencies[i] == module) _unresolvedDependencies.removeItemAt(i);
            }
        }
		
        public function load():void {
            LogUtil.debug("Loading " + name);
            var loader:ModuleLoaderService = new ModuleLoaderService();
            loader.load(this, _dispatcher);
        }
		
	}
}