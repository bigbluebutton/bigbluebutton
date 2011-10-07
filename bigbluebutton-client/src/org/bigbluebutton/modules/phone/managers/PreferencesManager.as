package org.bigbluebutton.modules.phone.managers
{
	import flash.events.EventDispatcher;
	import org.bigbluebutton.core.events.ErrorEvent;
	
	public class PreferencesManager extends EventDispatcher {
		private static var sharedObject:SharedObject = SharedObject.getLocal("BBBUserPreferences", "/");
		
		public function savePreference(key:String, value:Object):void{
			sharedObject.data[key] = value;
			try{
				sharedObject.flush(1000);
			} catch(err:Error){
				dispatchEvent(new ErrorEvent("SavingErrorEvent", true, true));
			}
		}
		
		public function getPreference(key:String):Object {
			return sharedObject.data[key];
		}
	}
}
