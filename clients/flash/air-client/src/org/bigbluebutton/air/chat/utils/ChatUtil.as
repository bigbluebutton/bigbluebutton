package org.bigbluebutton.air.chat.utils {
	
	import flash.system.Capabilities;
	
	public class ChatUtil {
		public static function getUserLang():String {
			return Capabilities.language.split("_")[0];
		}
		
		public static function getCurrentTime():String {
			var time:Date = new Date();
			return ChatUtil.getHours(time) + ":" + ChatUtil.getMinutes(time);
		}
		
		public static function getMinutes(time:Date):String {
			var minutes:String;
			if (time.minutes < 10)
				minutes = "0" + time.minutes;
			else
				minutes = "" + time.minutes;
			return minutes;
		}
		
		public static function getHours(time:Date):String {
			var hours:String;
			if (time.hours < 10)
				hours = "0" + time.hours;
			else
				hours = "" + time.hours;
			return hours
		}
		
		public static function cleanup(message:String):String {
			var parsedString:String = message.replace('<', '&#60;')
			parsedString = parsedString.replace('>', '&#62;')
			return parsedString;
		}
		
		public static function parseURLs(message:String):String {
			var indexOfHTTP:Number = message.indexOf("http://");
			var indexOfWWW:Number = message.indexOf("www.");
			var indexOfHTTPS:Number = message.indexOf("https://");
			if (indexOfHTTP == -1 && indexOfWWW == -1 && indexOfHTTPS == -1)
				return message;
			var words:Array = message.split(" ");
			var parsedString:String = "";
			for (var n:Number = 0; n < words.length; n++) {
				var word:String = words[n] as String;
				if (word.indexOf("http://") != -1)
					parsedString += '<a href="event:' + word + '"> <u>' + word + '</u></a> ';
				else if (word.indexOf("https://") != -1)
					parsedString += '<a href="event:' + word + '"> <u>' + word + '</u></a> ';
				else if (word.indexOf("www.") != -1)
					parsedString += '<a href="event:http://' + word + '"> <u>' + word + '</u></a> ';
				else
					parsedString += word + ' ';
			}
			return parsedString;
		}
		
		public static function genCorrelationId(userId:String):String {
			var now: Date = new Date();
			return userId + "-" + now.time;
		}
	}
}
