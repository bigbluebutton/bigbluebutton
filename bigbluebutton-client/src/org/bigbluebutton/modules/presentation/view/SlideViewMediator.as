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
	import org.bigbluebutton.modules.presentation.controller.MoveSlideCommand;
	import org.bigbluebutton.modules.presentation.controller.ZoomSlideCommand;
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
	public class SlideViewMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "SlideViewMediator";
		public static const SEND_PAGE_NUM:String = "send page number";
		
		public static const ZOOM:String = "zooming in/out";
		public static const MOVE:String = "moving slide";
		public static const RESIZE_EVENT:String = "RESIZE_EVENT";
		
		private var _slideView:SlideView;
		
		private var xPercent:Number;
		private var yPercent:Number;
		
		public function SlideViewMediator(viewComponent:SlideView)
		{
			super(NAME);
			_slideView = viewComponent;
			_slideView.addEventListener(ZOOM, zoom);
			_slideView.addEventListener(MOVE, move);
			_slideView.addEventListener(RESIZE_EVENT, resize);
		}
		
		protected function zoom(e:Event):void {
			xPercent = _slideView.myLoader.width / _slideView.imageCanvas.width;
			yPercent = _slideView.myLoader.height / _slideView.imageCanvas.height;
						
			var z:ZoomNotifier = new ZoomNotifier(yPercent, xPercent);			
			facade.sendNotification(ZoomSlideCommand.ZOOM_SLIDE_COMMAND, z);			
		}
		
		protected function move(e:Event):void {
			var xOffset:Number = _slideView.myLoader.x / _slideView.imageCanvas.width;
			var yOffset:Number = _slideView.myLoader.y / _slideView.imageCanvas.height;
			
			var m:MoveNotifier = new MoveNotifier(xOffset, yOffset);			
			facade.sendNotification(MoveSlideCommand.MOVE_SLIDE_COMMAND, m);
		}
		
		private function resize(e:Event):void{
			var z:ZoomNotifier = new ZoomNotifier(yPercent, xPercent);			
			facade.sendNotification(ZoomSlideCommand.ZOOM_SLIDE_COMMAND, z);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.ZOOM_SLIDE,
					PresentModuleConstants.MOVE_SLIDE,
					PresentModuleConstants.SLIDE_LOADED,
					PresentModuleConstants.SYNC_ZOOM
					];
		}
		
		override public function handleNotification(notification:INotification):void {
			switch(notification.getName()){
				case PresentModuleConstants.ZOOM_SLIDE:
					var zoomNote:ZoomNotifier = notification.getBody() as ZoomNotifier;
					xPercent = zoomNote.newWidth;
					yPercent = zoomNote.newHeight;
					_slideView.myLoader.width = zoomNote.newWidth * _slideView.imageCanvas.width;
					_slideView.myLoader.height = zoomNote.newHeight * _slideView.imageCanvas.height;
				break;
				case PresentModuleConstants.MOVE_SLIDE:
					var moveNote:MoveNotifier = notification.getBody() as MoveNotifier;
					_slideView.myLoader.x = moveNote.newXPosition * _slideView.imageCanvas.width;
					_slideView.myLoader.y = moveNote.newYPosition * _slideView.imageCanvas.height;
				break;
				case PresentModuleConstants.SLIDE_LOADED:
					_slideView.myLoader.source = notification.getBody().slide;
				break;
				case PresentModuleConstants.SYNC_ZOOM:
					zoom(new Event("event"));
				break;
			}
		}

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
	}
}