package org.bigbluebutton.modules.settings.util
{
	import flash.net.SharedObject;

	public class PersistUserPreferences
	{
		private static var sharedObject:SharedObject = SharedObject.getLocal("bbbUserProperties", "/");
		
		public static function storeData(preference:String, data:String):void{
			sharedObject.data[preference] = data;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveWebcamPreference(webcam:String):void{
			sharedObject.data["webcam"] = webcam;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveMicrophonePreference(microphone:String):void{
			sharedObject.data["microphone"] = microphone;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveMicrophoneGain(gain:Number):void{
			if (gain > 100 || gain < 0) return;
			
			sharedObject.data["gain"] = gain;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
		
		public static function saveSettingsVisited():void{
			sharedObject.data["previouslyvisited"] = true;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				trace("Could not flush shared object");
			}
		}
	}
}