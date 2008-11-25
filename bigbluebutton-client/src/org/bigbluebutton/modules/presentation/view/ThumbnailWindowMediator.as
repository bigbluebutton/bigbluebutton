/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.presentation.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.ThumbnailWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ThumbnailWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ThumbnailWindowMediator";

		private var _thumbWin:ThumbnailWindow;
		
		public function ThumbnailWindowMediator(viewComponent:ThumbnailWindow)
		{
			super(NAME);
			_thumbWin = viewComponent;
			_thumbWin.addEventListener(ThumbnailWindow.SLIDE_SELECTED, onSelectSlide);
			_thumbWin.addEventListener(Event.CLOSE, onWindowClose);
		}
		
		private function onWindowClose(e:Event):void {
        	sendNotification(PresentModuleConstants.THUMBNAIL_WINDOW_CLOSE);
        }
        	
		private function onSelectSlide(e:Event):void {
			proxy.gotoSlide(_thumbWin.slideList.selectedIndex);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.DISPLAY_SLIDE
					];
		}
		
		override public function handleNotification(notification:INotification):void {
			switch(notification.getName()){
				case PresentModuleConstants.DISPLAY_SLIDE:
					var slidenum:int = notification.getBody() as int;
					_thumbWin.slideList.scrollToIndex(slidenum);
					_thumbWin.slideList.selectedIndex = slidenum;
			}
		}

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
	}
}