package org.bigbluebutton.lib.main.commands {
	import org.bigbluebutton.lib.user.models.User2x;
	import org.osflash.signals.Signal;
	
	public class ChangeUserRoleSignal extends Signal {
		public function ChangeUserRoleSignal() {
			/**
			 * @1 User2x, role
			 */
			super(User2x, String);
		}
	}
}
