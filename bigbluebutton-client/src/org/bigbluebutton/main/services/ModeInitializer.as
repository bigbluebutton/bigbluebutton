package org.bigbluebutton.main.services
{
	import flash.external.ExternalInterface;
	
	public class ModeInitializer
	{
		public function getUrl():String {
			return ExternalInterface.call("window.location.search.substring", 1);
		}
		
		/**
		 * Attempts to extract from the URL if the client functions in 
		 * PLAYBACK or LIVE mode.
		 */
		public function queryMode(url:String):String
		{
			var _mode:String = 'LIVE';
			try {
				// Remove everything before the question mark, including the question mark
				var paramPattern:RegExp = /.*\?/;					
				url = url.replace(paramPattern, "");
					
				// Create an array of name=value Strings.
				var params:Array = url.split("&");
					
				// Print the params that are in the array.
				var keyStr:String;
				var valueStr:String;
				var paramObj:Object = params;
				
					
				for (keyStr in paramObj) {
					valueStr = String(paramObj[keyStr]);
					LogUtil.debug("PARAMS: " + keyStr + ":" + valueStr + "\n");
												
					for (var i:int = 0; i < params.length; i++) {
						var tempA:Array = params[i].split("=");
						if (String(tempA[0]).toUpperCase() == 'MODE') {
							if (String(tempA[1]).toUpperCase() == 'PLAYBACK') {
								LogUtil.debug('Setting to PLAYBACK mode.');
								_mode = 'PLAYBACK';
							} else {
								LogUtil.debug('Setting to LIVE mode.');
								_mode = 'LIVE';
							}
						}
					}
				}
			}catch(e:Error) {
				LogUtil.error(e.toString());
			}
			LogUtil.debug('MODE=' + _mode);
			return _mode;
		}
	}
}