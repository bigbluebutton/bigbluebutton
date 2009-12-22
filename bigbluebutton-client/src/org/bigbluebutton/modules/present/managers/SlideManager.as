/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.modules.present.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.utils.ByteArray;
	
	import org.bigbluebutton.modules.present.events.SlideEvent;

	public class SlideManager
	{
		private var slides:Object;
		private var dispatcher:Dispatcher;
		
		public function SlideManager()
		{
			slides = new Object();
			dispatcher = new Dispatcher();
		}
		
		public function load(slide:Slide):void {
			if (slide == null) return;
			
			slides[slide.slideNumber] = slide;
			slide.load(slideLoadListener);
		}
		
		public function clear():void {
			slides = null;
			slides = new Object();
		}
		
		private function slideLoadListener(slideNum:Number, slide:ByteArray):void {
			var e:SlideEvent = new SlideEvent(SlideEvent.SLIDE_LOADED);
			e.slide = slide;
			e.slideNumber = slideNum;
			dispatcher.dispatchEvent(e);
		}
	}
}