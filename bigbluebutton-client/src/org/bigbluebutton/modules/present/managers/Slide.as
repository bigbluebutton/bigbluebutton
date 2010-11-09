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
package org.bigbluebutton.modules.present.managers
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	
	public class Slide
	{
		private var _loader:URLLoader;
		private var _loaded:Boolean = false;
		private var _slideUri:String;
		private var _slideHandler:Function;
		private var _slideNum:Number;
		private var _thumbUri:String;
		
		public function Slide(slideNum:Number, slideUri:String, thumbUri:String)
		{
			_slideNum = slideNum;
			_slideUri = slideUri;
			_thumbUri = thumbUri;
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, handleComplete);	
			_loader.dataFormat = URLLoaderDataFormat.BINARY;		
		}

		public function load(slideLoadedHandler:Function):void {
			if (_loaded) {
				slideLoadedHandler(_slideNum, _loader.data);
			} else {
				_slideHandler = slideLoadedHandler;
				_loader.load(new URLRequest(_slideUri));
			}
		}
		
		private function handleComplete(e:Event):void{
			_loaded = true;
			if (_slideHandler != null) {
				_slideHandler(_slideNum, _loader.data);
			}		
		}
		
		public function get thumb():String {
			return _thumbUri;
		}
		
		public function get slideNumber():Number {
			return _slideNum;
		}
		
	}
}