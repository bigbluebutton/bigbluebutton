/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
 * Author: Felipe Cecagno <felipe@mconf.org>
 */
package org.bigbluebutton.modules.layout.model
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.ProgressEvent;
	import flash.events.IOErrorEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.FileReference;

	import mx.controls.Alert;

	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.layout.managers.LayoutManager;

	public class LayoutFileLoader extends EventDispatcher {
		private var _fileRef:FileReference;
		private var _manager:LayoutManager;
		private var _component:Sprite;
		
		public function LayoutFileLoader(component:Sprite) {
			_component = component;
		}
		
		public function startLoading(manager:LayoutManager):void {
			_manager = manager;
			_fileRef = new FileReference();
			_fileRef.addEventListener(Event.SELECT, onFileSelected); 
			_fileRef.addEventListener(Event.CANCEL, onCancel); 
			_fileRef.addEventListener(IOErrorEvent.IO_ERROR, onIOError); 
			_fileRef.addEventListener(SecurityErrorEvent.SECURITY_ERROR, onSecurityError);
			_fileRef.browse();
		}
		
		private function onFileSelected(evt:Event):void { 
			LogUtil.debug("File selected.");
			_fileRef.addEventListener(ProgressEvent.PROGRESS, onProgress);
			_fileRef.addEventListener(Event.COMPLETE, onComplete);
			_fileRef.load();
		} 
        
		private function onProgress(evt:ProgressEvent):void { 
			LogUtil.debug("Loaded " + evt.bytesLoaded + " of " + evt.bytesTotal + " bytes."); 
		} 
		
		private function onComplete(evt:Event):void { 
			_manager.completeHandler(evt);
			showAlert("File was successfully loaded.");
		} 
		
		private function onCancel(evt:Event):void { 
			LogUtil.debug("The browse request was canceled by the user."); 
		} 
		
		private function unknownError():void {
			showAlert("There was an unkwn error.");
		}
		
		private function onIOError(evt:IOErrorEvent):void { 
			showAlert("There was an IO Error.");
		} 

		private function onSecurityError(evt:Event):void { 
			showAlert("There was a security error.");
		}
		
		private function showAlert(s:String):void {
			Alert.show(s, "", Alert.OK, _component);
		}
	}
}