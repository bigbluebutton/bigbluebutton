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
package org.bigbluebutton.modules.videoconf.model {
	import org.bigbluebutton.core.Options;
	import org.bigbluebutton.util.browser.BrowserCheck;

	public class VideoConfOptions extends Options {
		public var uri:String = "rtmp://localhost/video";

		[Bindable]
		public var autoStart:Boolean = false;

		[Bindable]
		public var showButton:Boolean = true;

		[Bindable]
		public var applyConvolutionFilter:Boolean = false;

		[Bindable]
		public var convolutionFilter:Array = [-1, 0, -1, 0, 6, 0, -1, 0, -1];

		[Bindable]
		public var filterBias:Number = 0;

		[Bindable]
		public var filterDivisor:Number = 4;

		[Bindable]
		public var baseTabIndex:int = 101;

		[Bindable]
		public var displayAvatar:Boolean = false;

		[Bindable]
		public var skipCamSettingsCheck:Boolean = false;

		[Bindable]
		public var priorityRatio:Number = 2 / 3;

		public function VideoConfOptions() {
			name = "VideoconfModule";
		}

		override protected function handleExtraData():void {
			// If we are using Puffin browser
			if (BrowserCheck.isPuffinBelow46()) {
				showButton = false;
			}
		}

	}
}
