/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
package org.bigbluebutton.modules.users.model {

	import org.bigbluebutton.core.Options;

	public class UsersOptions extends Options {

		[Bindable]
		public var baseTabIndex:int = 301;

		[Bindable]
		public var allowKickUser:Boolean = true;

		[Bindable]
		public var enableEmojiStatus:Boolean = true;

		[Bindable]
		public var enableSettingsButton:Boolean = true;

		[Bindable]
		public var enableGuestUI:Boolean = false;

		[Bindable]
		public var allowClearRecordingMarks:Boolean = false;

		public var guestSoftMode:Boolean = false;


		public function UsersOptions() {
			name = "UsersModule";
		}

	}
}
