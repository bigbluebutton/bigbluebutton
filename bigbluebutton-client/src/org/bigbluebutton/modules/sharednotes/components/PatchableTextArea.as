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
package org.bigbluebutton.modules.sharednotes.components
{
	import mx.controls.TextArea;
	
	import org.bigbluebutton.modules.sharednotes.util.DiffPatch;
	
	public class PatchableTextArea extends TextArea
	{
		private var _tackOnText : String = "";
		private var _tackOnTextChanged : Boolean = false;
		
		private var _patch : String = "";
		private var _patchChanged : Boolean = false;
		
		public function set tackOnText(value:String):void
		{
			_tackOnText = value;
			_tackOnTextChanged = true;
			invalidateProperties();
		}
		
		public function get tackOnText():String
		{
			return _tackOnText;
		}
		
		public function set patch(value:String):void
		{
			_patch = value;
			_patchChanged = true;
			invalidateProperties();
		}
		
		public function get patch():String
		{
			return _patch;
		} 
		
		override protected function commitProperties():void
		{
			super.commitProperties();
			
			if (_patchChanged) {
					patchClientText();
					patch = "";
					_patchChanged = false;
			}
			
			if(_tackOnTextChanged) {
				this.textField.text += tackOnText;
				tackOnText = "";
				_tackOnTextChanged = false;
			}
		}
		
		public function get textFieldText():String {
			return this.textField.text;
		}
		
		private function patchClientText():void {
			var results:Array = DiffPatch.patchClientText(patch, textField.text, selectionBeginIndex, selectionEndIndex);
			
			textField.text = results[1];

			var cursorSelection:Array = results[0];
			textField.setSelection(cursorSelection[0], cursorSelection[1]);
		}
	}
}