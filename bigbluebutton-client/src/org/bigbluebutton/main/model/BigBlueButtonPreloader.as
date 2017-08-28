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
package org.bigbluebutton.main.model
{
	import flash.display.Sprite;
	import flash.geom.Rectangle;
	
	import mx.events.RSLEvent;
	import mx.preloaders.DownloadProgressBar;
	
	public class BigBlueButtonPreloader extends DownloadProgressBar
	{
		private var _labelRect:Rectangle = null; 
		
		public function BigBlueButtonPreloader()
		{
			super();
			downloadingLabel = "Downloading ...";
			initializingLabel = "Starting...";
			MINIMUM_DISPLAY_TIME = 0;
		}
		
		override public function set preloader(value:Sprite):void{
			super.preloader = value;
			value.addEventListener(RSLEvent.RSL_ERROR, sharedLibraryLoadingFailed);
		}
		
		override protected function get labelRect():Rectangle{
			// this is used to change the label width from 100 to 154, to better fit the label text
			if (_labelRect == null) {
				_labelRect = new Rectangle(
					super.labelRect.x,
					super.labelRect.y,
					super.barRect.width,
					super.labelRect.height);
			}
			return _labelRect;
		}
		
		private function sharedLibraryLoadingFailed(e:RSLEvent):void{
//			ResourceUtil.getInstance().changeLocale([ResourceUtil.DEFAULT_LANGUAGE]);
		}

	}
}
