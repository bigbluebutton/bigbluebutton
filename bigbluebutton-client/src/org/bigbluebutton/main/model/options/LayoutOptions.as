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
package org.bigbluebutton.main.model.options {
	import org.bigbluebutton.core.Options;

	public class LayoutOptions extends Options {

		[Bindable]
		public var showLogButton:Boolean = true;

		[Bindable]
		public var showToolbar:Boolean = true;

		[Bindable]
		public var showFooter:Boolean = true;

		[Bindable]
		public var showMeetingName:Boolean = true;

		[Bindable]
		public var showHelpButton:Boolean = true;

		[Bindable]
		public var showLogoutWindow:Boolean = true;

		[Bindable]
		public var showLayoutTools:Boolean = true;

		[Bindable]
		public var confirmLogout:Boolean = true;

		[Bindable]
		public var showRecordingNotification:Boolean = true;

		[Bindable]
		public var logoutOnStopRecording:Boolean = false;

		[Bindable]
		public var showNetworkMonitor:Boolean = false;

		[Bindable]
		public var askForFeedbackOnLogout:Boolean = false;

		public var defaultLayout:String = "Default";

		public function LayoutOptions() {
			name = "layout";
		}
	}
}
