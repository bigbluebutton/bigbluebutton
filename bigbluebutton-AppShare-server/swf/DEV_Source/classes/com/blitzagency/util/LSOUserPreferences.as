import mx.events.EventDispatcher;

class com.blitzagency.util.LSOUserPreferences {

// Public Properties
	public static var loaded:Boolean = false;
	public static var persistent:Boolean = true;
	public static var addEventListener:Function;
	public static var removeEventListener:Function;
	
	// call for initialization when LSOPreferences is loaded
	public static var initialized:Boolean = initializeEvents();

// Private Properties
	private static var preferences:Object = {};
	private static var storedObject:SharedObject;
	private static var dispatchEvent:Function;

// Initialization
	private function LSOUserPreferences() {	}
	
	private static function initializeEvents():Boolean
	{
		trace("initializeEvents called");
		EventDispatcher.initialize(LSOUserPreferences);
		return true;
	}

// Public Methods
		
	// Retrieve Preference
	public static function getPreference(p_key:String) {
		if (preferences[p_key] == undefined) {
			// Try and get LSO property?
			return;
		}
		return preferences[p_key];
	}
	
	public static function getAllPreferences():Object {
		return preferences;
	}

	// Set Local/LSO Preference
	public static function setPreference(p_key:String, p_value, p_persistent:Boolean):Void {
		preferences[p_key] = p_value;

		// Optionally save to LSO
		if (p_persistent == undefined) { p_persistent = persistent; } // Use Default Setting
		if (p_persistent) {
			storedObject.data[p_key] = p_value;
			var r = storedObject.flush();
			var m:String;
			switch (r) {
				case "pending": 	m = "Flush is pending, waiting on user interaction"; 			break;
				case true: 		m = "Flush was successful.  Requested Storage Space Approved"; 	break;
				case false: 	m = "Flush failed.  User denied request for additional space."; 	break;
			}

			dispatchEvent({type:"onSave", success:r, msg:m, preference:p_key});
		}
	}

	// Load from LSO for now
	public static function load(p_path:String):Void 
	{		
		storedObject = SharedObject.getLocal("userPreferences" + _root.projectID, "/");
		for (var i:String in storedObject.data) {
			preferences[i] = storedObject.data[i];
		}
		loaded = true;
		dispatchEvent({type:"load", target:LSOUserPreferences, success:true});
	}

	// Clear LSO and reset preferences
	public static function clear():Void {
		storedObject.clear();
		storedObject.flush();
		delete storedObject;
		preferences = {};
	}

// Semi-Public Methods
// Private Methods

}