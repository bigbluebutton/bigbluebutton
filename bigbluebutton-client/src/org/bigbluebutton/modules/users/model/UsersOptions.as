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

	import org.bigbluebutton.core.BBB;

	public class UsersOptions {
		
		[Bindable]
		public var windowVisible:Boolean = true;
		
		[Bindable]
		public var position:String = "top-left";
		
		[Bindable]
		public var baseTabIndex:int = 301;
		
		[Bindable]
		public var allowKickUser:Boolean = true;
		
		[Bindable]
		public var enableEmojiStatus:Boolean = true;

		[Bindable]
		public var enableSettingsButton:Boolean = true;

		public function UsersOptions() {
			var vxml:XML = BBB.getConfigForModule("UsersModule");
			if (vxml != null) {
				windowVisible = (vxml.@windowVisible.toString().toUpperCase() == "TRUE") ? true : false;
			}
			if (vxml.@position != undefined) {
				position = vxml.@position.toString();
			}
			if (vxml.@baseTabIndex != undefined) {
				baseTabIndex = vxml.@baseTabIndex;
			}
			if (vxml.@allowKickUser != undefined) {
				allowKickUser = (vxml.@allowKickUser.toString().toUpperCase() == "TRUE") ? true : false;
			}
			if (vxml.@enableEmojiStatus != undefined) {
				enableEmojiStatus = (vxml.@enableEmojiStatus.toString().toUpperCase() == "TRUE") ? true : false;
			}
			if (vxml.@enableSettingsButton != undefined) {
				enableSettingsButton = (vxml.@enableSettingsButton.toString().toUpperCase() == "TRUE") ? true : false;
			}
		}

	}
}
