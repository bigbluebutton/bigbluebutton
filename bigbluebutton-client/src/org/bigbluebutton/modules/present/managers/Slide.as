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
package org.bigbluebutton.modules.present.managers
{
	import flash.events.Event;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	
	[Bindable]
	public class Slide
	{
		private var _loader:URLLoader;
		private var _loaded:Boolean = false;
		private var _slideUri:String;
		private var _slideHandler:Function;
		private var _slideNum:Number;
		private var _thumbUri:String;
		private var _txtUri:String;
		private var _txtLoader:URLLoader;
		private var _txtLoaded:Boolean = false;

				
		public function Slide(slideNum:Number, slideUri:String, thumbUri:String,txtUri:String)
		{
			_slideNum = slideNum;
			_slideUri = slideUri;
			_thumbUri = thumbUri;
			_txtUri = txtUri;
			_loader = new URLLoader();
			_loader.addEventListener(Event.COMPLETE, handleComplete);	
			_loader.dataFormat = URLLoaderDataFormat.BINARY;
			
			_txtLoader = new URLLoader();
			_txtLoader.addEventListener(Event.COMPLETE, handleTextComplete);	
			_txtLoader.dataFormat = URLLoaderDataFormat.TEXT;	
		}

		public function load(slideLoadedHandler:Function):void {
			if (_loaded && _txtLoaded) {
				slideLoadedHandler(_slideNum, _loader.data, _txtLoader.data);
			} else {
				_slideHandler = slideLoadedHandler;
				_loader.load(new URLRequest(_slideUri));
				_txtLoader.load(new URLRequest(_txtUri));
			}
		}
		
		private function handleComplete(e:Event):void{
			_loaded = true;
			if (_slideHandler != null && _txtLoaded) {
				_slideHandler(_slideNum, _loader.data, _txtLoader.data);
			}		
		}
		
		private function handleTextComplete(e:Event):void{
			_txtLoaded = true;
			if (_slideHandler != null && _loaded) {
				_slideHandler(_slideNum, _loader.data, _txtLoader.data);
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