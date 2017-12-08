/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.modules.present.events {
	import flash.events.Event;

	import org.bigbluebutton.modules.present.model.PresentationModel;
	import org.bigbluebutton.modules.present.ui.views.models.SlideViewModel;
	import org.bigbluebutton.modules.whiteboard.views.WhiteboardCanvas;

	public class ExportEvent extends Event {
		public static const OPEN_EXPORT_WINDOW:String = "OPEN_EXPORT_WINDOW";

		public static const CLOSE_EXPORT_WINDOW:String = "CLOSE_EXPORT_WINDOW";

		public static const EXPORT_NEXT_PAGE:String = "EXPORT_NEXT_PAGE";

		public static const EXPORT_COMPLETE:String = "EXPORT_COMPLETE";

		public var firstPage:int;

		public var numberOfPages:int;

		public var slidesUrl:String;

		public var slideModel:SlideViewModel;

		public var presentationModel:PresentationModel;

		public var whiteboardCanvas:WhiteboardCanvas

		public function ExportEvent(type:String) {
			super(type, true, false);
		}
	}
}
