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
package org.bigbluebutton.modules.phone
{
	import org.bigbluebutton.core.BBB;

	public class PhoneOptions {
		[Bindable]
		public var showButton:Boolean = true;

		[Bindable]
		public var autoJoin:Boolean = false;
		
		[Bindable]
		public var skipCheck:Boolean = false;
		
		[Bindable]
		public var enabledEchoCancel:Boolean = false;

		[Bindable]
		public var listenOnlyMode:Boolean = true;

		[Bindable]
		public var presenterShareOnly:Boolean = false;

		[Bindable]
		public var showSpeakerButton:Boolean = true;

		public function PhoneOptions() {
			var vxml:XML = BBB.getConfigForModule("PhoneModule");
			if (vxml != null) {
				this.showButton = (vxml.@showButton.toString().toUpperCase() == "TRUE") ? true : false;
				this.autoJoin = (vxml.@autoJoin.toString().toUpperCase() == "TRUE") ? true : false;
				this.skipCheck = (vxml.@skipCheck.toString().toUpperCase() == "TRUE") ? true : false;
				this.listenOnlyMode = (vxml.@listenOnlyMode.toString().toUpperCase() == "TRUE") ? true : false;
				this.presenterShareOnly = (vxml.@presenterShareOnly.toString().toUpperCase() == "TRUE") ? true : false;
				this.showSpeakerButton = (vxml.@showSpeakerButton.toString().toUpperCase() == "TRUE") ? true : false;
			}
		}
	}
}