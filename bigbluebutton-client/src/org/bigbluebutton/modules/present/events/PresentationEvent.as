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
package org.bigbluebutton.modules.present.events
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.present.managers.PresentationSlides;
	
	public class PresentationEvent extends Event
	{
		public static const PRESENTATION_LOADED:String = "Presentation Loaded";
		public static const PRESENTATION_NOT_LOADED:String = "Presentation Not Loaded";
		
		public var presentationName:String;
		private var _slides:PresentationSlides;
		public var numberOfPages:int;
		
		public function PresentationEvent(type:String)
		{
			super(type, true, false);
		}
		
		public function set slides(presentSlides:PresentationSlides):void{
			this._slides = presentSlides;
			this.numberOfPages = presentSlides.size();
		}
		
		public function get slides():PresentationSlides{
			return this._slides;
		}

	}
}