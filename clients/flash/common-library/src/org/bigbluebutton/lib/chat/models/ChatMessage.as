package org.bigbluebutton.lib.chat.models {
	
	public class ChatMessage {
		
		[Bindable]
		public var lastSenderId:String;
		
		[Bindable]
		public var senderId:String;
		
		[Bindable]
		public var senderLanguage:String;
		
		[Bindable]
		public var receiverLanguage:String;
		
		[Bindable]
		public var translate:Boolean;
		
		[Bindable]
		public var senderColor:uint;
		
		[Bindable]
		public var translateLocale:String = "";
		
		[Bindable]
		public var translatedLocaleTooltip:String = "";
		
		[Bindable]
		public var name:String;
		
		[Bindable]
		public var time:String;
		
		[Bindable]
		public var lastTime:String;
		
		[Bindable]
		public var senderText:String;
		
		[Bindable]
		public var translatedText:String;
		
		[Bindable]
		public var translated:Boolean = false;
		
		[Bindable]
		public var translatedColor:uint;
		
		// Stores the time (millis) when the sender sent the message.
		public var fromTime:Number;
		
		// Stores the timezone offset (minutes) of the sender.
		public var fromTimezoneOffset:Number;
		
		/*
		   // Stores what we display to the user. The converted fromTime and fromTimezoneOffset to local time.
		   [Bindable] public var senderTime:String;
		 */
		public function toString():String {
			var result:String;
			// Remember to localize this later
			result = "Chat message " + name + " said " + stripTags(translatedText) + " at " + time;
			return result;
		}
		
		private function stripTags(str:String, tags:String = null):String {
			var pattern:RegExp = /<\/?[a-zA-Z0-9]+.*?>/gim; // strips all tags
			if (tags != null) {
				// based upon //var stripPattern:String = "<(?!/?(b|img)(?=[^a-zA-Z0-9]))[^>]*/?>"; // errors
				// based upon //var stripPattern:String = "<(?!/?(b|img)(?=[^a-zA-Z0-9]))\/?[a-zA-Z0-9]+.*?/?>";
				var getChars:RegExp = /(<)([^>]*)(>)/gim;
				var stripPattern:String = tags.replace(getChars, "$2|");
				stripPattern = stripPattern.substr(0, -1);
				stripPattern = "<(?!/?(" + stripPattern + ")(?=[^a-zA-Z0-9]))\/?[a-zA-Z0-9]+.*?/?>";
				pattern = new RegExp(stripPattern, "gim");
			}
			return str.replace(pattern, "");
		}
	}
}
