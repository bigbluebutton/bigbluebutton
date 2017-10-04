package org.bigbluebutton.lib.user.views.models {
	import mx.collections.ArrayCollection;
	import mx.collections.Sort;
	
	import org.bigbluebutton.lib.user.models.EmojiStatus;
	import org.bigbluebutton.lib.user.models.UserRole;
	
	public class UsersVMCollection extends ArrayCollection {
		public function UsersVMCollection(source:Array = null) {
			super(source);
			
			sort = new Sort(null, sortFunction);
		}
		
		/**
		 * Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
		 */
		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			var au:UserVM = a as UserVM, bu:UserVM = b as UserVM;
			/*if (a.presenter)
			   return -1;
			   else if (b.presenter)
			   return 1;*/
			if (au.role == UserRole.MODERATOR && bu.role == UserRole.MODERATOR) {
				// do nothing go to the end and check names
			} else if (au.role == UserRole.MODERATOR)
				return -1;
			else if (bu.role == UserRole.MODERATOR)
				return 1;
			else if ((EmojiStatus.STATUS_ARRAY.indexOf(au.emoji) > -1) && (EmojiStatus.STATUS_ARRAY.indexOf(bu.emoji) > -1)) {
				// do nothing go to the end and check names
			} else if (EmojiStatus.STATUS_ARRAY.indexOf(au.emoji) > -1)
				return -1;
			else if (EmojiStatus.STATUS_ARRAY.indexOf(au.emoji) > -1)
				return 1;
			else if (au.phoneUser && bu.phoneUser) {
			} else if (au.phoneUser)
				return -1;
			else if (bu.phoneUser)
				return 1;
			/**
			 * Check name (case-insensitive) in the event of a tie up above. If the name
			 * is the same then use userID which should be unique making the order the same
			 * across all clients.
			 */
			if (au.name.toLowerCase() < bu.name.toLowerCase())
				return -1;
			else if (au.name.toLowerCase() > bu.name.toLowerCase())
				return 1;
			else if (au.intId.toLowerCase() > bu.intId.toLowerCase())
				return -1;
			else if (au.intId.toLowerCase() < bu.intId.toLowerCase())
				return 1;
			return 0;
		}
	}
}
