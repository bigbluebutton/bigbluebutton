package org.bigbluebutton.util
{
	import flash.external.ExternalInterface;
	
	public class QueryStringParameters {
		private var params:Array;
		
		public function collectParameters():void {
			try {
				var url:String = ExternalInterface.call("window.location.search.substring", 1);
				//var url:String = "host.pl?logouturl=http://www.google.com&host=rtmp://192.168.0.120/deskShare&room=6e87dfef-9f08-4f80-993f-c0ef5f7b999b&width=1024&height=768";
				// Remove everything before the question mark, including the question mark
				var paramPattern:RegExp = /.*\?/;					
				url = url.replace(paramPattern, "");
					
				// Create an array of name=value Strings.
				params = url.split("&");
									
			} catch(e:Error) {
				LogUtil.error(e.toString());
			}
		}
		
		public function getParameter(key:String):String {
			var value:String = "";
						
			for (var i:int = 0; i < params.length; i++) {
				var tempA:Array = params[i].split("=");
				trace(String(tempA[0]).toUpperCase() + " " + String(tempA[1]).toUpperCase());

				if (String(tempA[0]).toUpperCase() == key.toUpperCase()) {
					value = String(tempA[1])
				}
			}
			return value;
		}
	}
}