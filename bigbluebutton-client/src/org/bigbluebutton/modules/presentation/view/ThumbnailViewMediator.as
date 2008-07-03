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
	
	import org.bigbluebutton.modules.presentation.PresentationFacade;
	import org.bigbluebutton.modules.presentation.controller.notifiers.MoveNotifier;
	import org.bigbluebutton.modules.presentation.controller.notifiers.ZoomNotifier;
	import org.bigbluebutton.modules.presentation.model.business.PresentationDelegate;
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
		
		/**
		 * The defauklt constructor. registers the gui component with this mediator 
		 * @param view
		 * 
		 */		
		public function ThumbnailViewMediator(view:ThumbnailView)
		{
			super(NAME, view);
			thumbnailView.addEventListener(SEND_PAGE_NUM, sendPageNumber);
			thumbnailView.addEventListener(ZOOM, zoom);
			thumbnailView.addEventListener(MOVE, move);
		}
		
		/**
		 *  
		 * @return - the GUI component registered to this mediator
		 * 
		 */		
		public function get thumbnailView():ThumbnailView{
			return viewComponent as ThumbnailView;
		}
		
		/**
		 * Sends out a sendPageNumber notification 
		 * @param e
		 * 
		 */		
		private function sendPageNumber(e:Event) : void {
			thumbnailView.myLoader.percentHeight = 100;
			thumbnailView.myLoader.percentWidth = 100;
			thumbnailView.myLoader.x = 1;
			thumbnailView.myLoader.y = 1;
			
			if ((thumbnailView.model.presentation.isPresenter) && (thumbnailView.model.presentation.isSharing)) {
				var pageNum : uint = thumbnailView.slideList.selectedIndex;
			
				proxy.gotoPage(pageNum);
			}
		}
		
		/**
		 *  
		 * @return - the PresentationDelegate proxy of the Presentation Module
		 * 
		 */		
		private function get proxy():PresentationDelegate{
			return facade.retrieveProxy(PresentationDelegate.ID) as PresentationDelegate;
		}
		
		private function zoom(e:Event):void{
			var xPercent:Number = thumbnailView.myLoader.width / thumbnailView.imageCanvas.width;
			var yPercent:Number = thumbnailView.myLoader.height / thumbnailView.imageCanvas.height;
			
			proxy.zoom(xPercent, yPercent);
		}
		
		private function move(e:Event):void{
			var xOfset:Number = thumbnailView.myLoader.x / thumbnailView.imageCanvas.width;
			var yOfset:Number = thumbnailView.myLoader.y / thumbnailView.imageCanvas.height;
			
			proxy.move(xOfset, yOfset);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentationFacade.ZOOM_SLIDE,
					PresentationFacade.MOVE_SLIDE
					];
		}
		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case PresentationFacade.ZOOM_SLIDE:
					var zoomNote:ZoomNotifier = notification.getBody() as ZoomNotifier;
					if (!thumbnailView.model.presentation.isPresenter){
						thumbnailView.myLoader.width = zoomNote.newWidth * thumbnailView.imageCanvas.width;
						thumbnailView.myLoader.height = zoomNote.newHeight * thumbnailView.imageCanvas.height;
					}
					break;
				case PresentationFacade.MOVE_SLIDE:
					var moveNote:MoveNotifier = notification.getBody() as MoveNotifier;
					if (!thumbnailView.model.presentation.isPresenter){
						thumbnailView.myLoader.x = moveNote.newXPosition * thumbnailView.imageCanvas.width;
						thumbnailView.myLoader.y = moveNote.newYPosition * thumbnailView.imageCanvas.height;
					}
					break;
			}
		}

	}
}