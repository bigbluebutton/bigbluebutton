package org.bigbluebutton.air.user.utils {
	
	public final class UserUtils {
		/**
		 * Returns the first uppercased letters from a user full name whatever
		 * words number is used
		 */
		public static function getInitials(name:String):String {
			if (name) {
				var matches:Array = name.match(/\b\w/g) || [];
				return ((matches.shift() || '') + (matches.pop() || '')).toUpperCase();
			} else {
				return "";
			}
		}
	}
}
