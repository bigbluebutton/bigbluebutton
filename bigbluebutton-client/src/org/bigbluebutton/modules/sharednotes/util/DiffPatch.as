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