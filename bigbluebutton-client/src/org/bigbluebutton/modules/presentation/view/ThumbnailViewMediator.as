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
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.SlideView;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * This class is the Mediator of the ThumbnailView GUI component
	 * <p>
	 * This class extends the Mediator class of the pureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ThumbnailViewMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ThumbnailViewMediator";
		public static const SEND_PAGE_NUM:String = "send page number";
		
		public static const ZOOM:String = "zooming in/out";
		public static const MOVE:String = "moving slide";
		
		private var _slideView:SlideView;
		
		/**
		 * The defauklt constructor. registers the gui component with this mediator 
		 * @param view
		 * 
		 */		
		public function ThumbnailViewMediator(viewComponent:SlideView)
		{
			super(NAME);
			_slideView = viewComponent;
			_slideView.addEventListener(SEND_PAGE_NUM, sendPageNumber);
			_slideView.addEventListener(ZOOM, zoom);
			_slideView.addEventListener(MOVE, move);
		}
		
		
		/**
		 * Sends out a sendPageNumber notification 
		 * @param e
		 * 
		 */		
		protected function sendPageNumber(e:Event) : void {
			_slideView.myLoader.percentHeight = 100;
			_slideView.myLoader.percentWidth = 100;
			_slideView.myLoader.x = 1;
			_slideView.myLoader.y = 1;
			
//			facade.sendNotification(PresentModuleConstants.GOTO_SLIDE, _slideView.slideList.selectedIndex + 1);
		}
		
		protected function zoom(e:Event):void{
			var xPercent:Number = _slideView.myLoader.width / _slideView.imageCanvas.width;
			var yPercent:Number = _slideView.myLoader.height / _slideView.imageCanvas.height;
			
			proxy.zoom(xPercent, yPercent);
		}
		
		protected function move(e:Event):void{
			var xOffset:Number = _slideView.myLoader.x / _slideView.imageCanvas.width;
			var yOffset:Number = _slideView.myLoader.y / _slideView.imageCanvas.height;
			
			proxy.move(xOffset, yOffset);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.ZOOM_SLIDE,
					PresentModuleConstants.MOVE_SLIDE,
					PresentModuleConstants.MAXIMIZE_PRESENTATION
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PresentModuleConstants.ZOOM_SLIDE:
					var zoomNote:ZoomNotifier = notification.getBody() as ZoomNotifier;
					if (! proxy.isPresenter()){
						_slideView.myLoader.width = zoomNote.newWidth * _slideView.imageCanvas.width;
						_slideView.myLoader.height = zoomNote.newHeight * _slideView.imageCanvas.height;
					}
					break;
				case PresentModuleConstants.MOVE_SLIDE:
					var moveNote:MoveNotifier = notification.getBody() as MoveNotifier;
					if (! proxy.isPresenter()){
						_slideView.myLoader.x = moveNote.newXPosition * _slideView.imageCanvas.width;
						_slideView.myLoader.y = moveNote.newYPosition * _slideView.imageCanvas.height;
					}
					break;
				case PresentModuleConstants.DISPLAY_SLIDE:
					
					var slidenum:int = notification.getBody() as int;
					trace('DISPLAY_SLIDE in ThumbnailMediator ' + slidenum);
					if ((slidenum > 0) && (slidenum <= _slideView.slides.length)) {
//						if (_slideView.slideList.selectedIndex != slidenum) {
//							_slideView.slideList.selectedIndex = slidenum - 1;
//						}	
					} else {
						trace('Cannot DISPLAY_SLIDE in ThumbnailMediator ' + slidenum + " " + _slideView.slides.length);
					}
					break;
				case PresentModuleConstants.MAXIMIZE_PRESENTATION:
					viewComponent.myLoader.percentHeight = 100;
					viewComponent.myLoader.percentWidth = 100;
					break;
			}
		}

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
	}
}