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
package org.bigbluebutton.modules.layout.model
{
	import flash.events.EventDispatcher;
	import flash.events.Event;
	import flash.events.ProgressEvent;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.FileReference;

	import flash.net.URLLoader;
	import flash.net.URLRequest;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.EventBroadcaster;
	import org.bigbluebutton.core.model.Config;
	import org.bigbluebutton.modules.layout.events.LayoutsLoadedEvent;
	import org.bigbluebutton.modules.layout.model.LayoutDefinition;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	
	public class LayoutLoader extends EventDispatcher {
    private static const LOG:String = "Layout::LayoutLoader - ";
    
		private var _fileRef:FileReference;
		
		public function loadFromUrl(layoutUrl:String):void {
			var urlLoader:URLLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, onComplete);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
			var date:Date = new Date();
			try {
				urlLoader.load(new URLRequest(layoutUrl + "?a=" + date.time));
			} catch (e:Error) {
				trace(LOG + " exception while loading the layout definition file (" + e + ")");
			}
		}
		
		public function loadFromLocalFile():void {
			_fileRef = new FileReference();
			_fileRef.addEventListener(Event.SELECT, onFileSelected); 
			_fileRef.addEventListener(Event.CANCEL, onCancel); 
			_fileRef.addEventListener(IOErrorEvent.IO_ERROR, onIOError); 
			_fileRef.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			_fileRef.browse();
		}
		
		private function onComplete(evt:Event):void {
			trace(LOG + " completed, parsing...");
			var layouts:LayoutDefinitionFile = new LayoutDefinitionFile();
			var event:LayoutsLoadedEvent = new LayoutsLoadedEvent();
			try {
				var data:XML = new XML(evt.target.data);
				for each (var n:XML in data.layout) {
					layouts.pushXml(n);
				}
				event.layouts = layouts;
				event.success = true;
				dispatchEvent(event);
			} catch (error:TypeError) {
				event.success = false;
				event.error = new TypeError("Failed to parse the XML: " + error.message);
				dispatchEvent(event);
			}
		}
		
		private function onFileSelected(evt:Event):void { 
			trace(LOG + " file selected");
			_fileRef.addEventListener(ProgressEvent.PROGRESS, onProgress);
			_fileRef.addEventListener(Event.COMPLETE, onComplete);
			_fileRef.load();
		} 
        
		private function onProgress(evt:ProgressEvent):void {
			trace(LOG + " loaded " + evt.bytesLoaded + " of " + evt.bytesTotal + " bytes"); 
		} 

		private function onCancel(evt:Event):void {
			trace(LOG + " the browse request was canceled by the user"); 
		} 
		
		private function onIOError(evt:IOErrorEvent):void {
			var event:LayoutsLoadedEvent = new LayoutsLoadedEvent();
			event.success = false;
			event.error = new TypeError(ResourceUtil.getInstance().getString('bbb.layout.load.ioError'));
			dispatchEvent(event);
		} 

		private function onSecurityError(evt:Event):void { 
			var event:LayoutsLoadedEvent = new LayoutsLoadedEvent();
			event.success = false;
			event.error = new TypeError(ResourceUtil.getInstance().getString('bbb.layout.load.securityError'));
			dispatchEvent(event);
		}
	}
}