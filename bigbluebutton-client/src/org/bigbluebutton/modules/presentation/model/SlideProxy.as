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
package org.bigbluebutton.modules.presentation.model
{
	import flash.utils.ByteArray;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.puremvc.as3.multicore.interfaces.IProxy;
	import org.puremvc.as3.multicore.patterns.proxy.Proxy;

	public class SlideProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "SlideProxy";
		
		private var _slides:Object;
		
		public function SlideProxy()
		{
			super(NAME);
			_slides = new Object();
		}
		
		public function load(slide:Slide):void {
			_slides[slide.slideNumber] = slide;
			slide.load(slideLoadListener);
		}
		
		public function clear():void {
			_slides = null;
			_slides = new Object();
		}
		
		private function slideLoadListener(slideNum:Number, slide:ByteArray):void {
			sendNotification(PresentModuleConstants.SLIDE_LOADED, {slideNum:slideNum, slide:slide});
		}
	}
}