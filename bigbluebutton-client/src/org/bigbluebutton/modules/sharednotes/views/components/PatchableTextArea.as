/*
	This file is part of BBB-Notes.
	
	Copyright (c) Islam El-Ashi. All rights reserved.
	
	BBB-Notes is free software: you can redistribute it and/or modify
	it under the terms of the Lesser GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or 
	any later version.
	
	BBB-Notes is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	Lesser GNU General Public License for more details.
	
	You should have received a copy of the Lesser GNU General Public License
	along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.
	
	Author: Islam El-Ashi <ielashi@gmail.com>, <http://www.ielashi.com>
*/
package org.bigbluebutton.modules.sharednotes.views.components
{
	import com.asfusion.mate.events.Dispatcher;

	import mx.controls.TextArea;
	
	import flash.events.Event;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.modules.sharednotes.util.DiffPatch;
	import flash.net.FileReference;
	import flexlib.mdi.containers.MDICanvas;
	import mx.controls.Alert;
	import org.bigbluebutton.util.i18n.ResourceUtil;
	import flash.geom.*;
	import flash.text.*;
	import flash.events.MouseEvent;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent

	public class PatchableTextArea extends TextArea
	{
		private var _patch : String = "";
		private var _patchChanged : Boolean = false;
		private var _canvas:MDICanvas = null;
		
		
		public function init():void {
			//textField.addEventListener(MouseEvent.CLICK, changeLastPosition); 
			//textField.addEventListener(FocusEvent.FOCUS_IN, restore);
			//textField.addEventListener(KeyboardEvent.KEY_UP, changeLastPosition);
		}

		
	
		
		
		public function set patch(value:String):void
		{
			_patch = value;
			_patchChanged = true;
			invalidateProperties();
		}
		
		 
		
		override protected function commitProperties():void
		{			
			super.commitProperties();
		}
		
		public function setCanvas(canvas:MDICanvas):void {
			_canvas = canvas;
		}	

		public function get textFieldText():String {

			
			return textField.text;
		}

		public function saveNotesToFile():void {
			this.textFieldText
			var _fileRef:FileReference = new FileReference();
			_fileRef.addEventListener(Event.COMPLETE, function(e:Event):void {
				Alert.show(ResourceUtil.getInstance().getString('bbb.sharedNotes.save.complete'), "", Alert.OK, _canvas);
			});
			_fileRef.save(this.textFieldText, "sharedNotes.txt");

			//var format:TextFormat = new TextFormat();
			//format.color = 0x0000FF;
			//this.textField.setTextFormat( format, selectionBeginIndex, selectionBeginIndex+1 ) ;
		}

		
		public function patchClientText(patch:String):void {
			var results:Array = DiffPatch.patchClientText(patch, textField.text, selectionBeginIndex, selectionEndIndex);
			this.text = results[1];
			LogUtil.debug("Posicao Inicial: " + selectionBeginIndex + " " + selectionEndIndex);
			LogUtil.debug("Posicao Final: " + results[0][0] + " " + results[0][1]);
			this.setSelection(results[0][0], results[0][1]);
		}
	}
}
