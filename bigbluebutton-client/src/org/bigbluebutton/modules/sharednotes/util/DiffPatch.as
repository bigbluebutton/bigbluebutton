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
package org.bigbluebutton.modules.sharednotes.util
{
	import flash.external.ExternalInterface;

	public class DiffPatch
	{
		public static function diff(originalText:String, modifiedText:String):String {
			var result:String = ExternalInterface.call("diff", escape(originalText), escape(modifiedText));

			if (result == null) throw new Error("Javascript files not found.");
			
			return result;
		}
		
		public static function patch(diff:String, text:String):String {
			var result:String = ExternalInterface.call("patch", diff, escape(text));
			
			if (result == null) throw new Error("Javascript files not found.");
			
			return result;
		}
		
		public static function unpatch(diff:String, text:String):String {
			var result:String = unescape(ExternalInterface.call("unpatch", diff, escape(text)));
			
			if (result == null) throw new Error("Javascript files not found.");
			
			return result;
		}
		
		public static function patchClientText(patches:String, clientText:String, selectionStart:int, selectionEnd:int):Array {
			var result:Array = ExternalInterface.call("patchClientText", patches, escape(clientText), selectionStart, selectionEnd);
			
			if (result == null) throw new Error("Javascript files not found.");
			
			return result;
		}
	}
}