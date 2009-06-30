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
package org.bigbluebutton.modules.presentation.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.presentation.PresentModuleConstants;
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.bigbluebutton.modules.presentation.view.components.FisheyeThumbnail;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class ThumbnailViewMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ThumbnailViewMediator";
		
		private var _thumbView:FisheyeThumbnail;
		
		public function ThumbnailViewMediator(viewComponent:FisheyeThumbnail)
		{
			super(NAME);
			_thumbView = viewComponent;
			_thumbView.addEventListener(FisheyeThumbnail.SLIDE_SELECTED, onSelectSlide);
		}
		
		private function onSelectSlide(e:Event):void {
			proxy.gotoSlide(_thumbView.fisheye.selectedIndex);
		}
		
		override public function listNotificationInterests():Array{
			return [
					PresentModuleConstants.GOTO_SLIDE
					];
		}
		
		override public function handleNotification(notification:INotification):void {
			switch(notification.getName()){ 
				case PresentModuleConstants.GOTO_SLIDE:
					highlightThumbnail(notification.getBody() as Number);
					break;
			}
		}

		private function get proxy():PresentProxy {
			var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
			return p;
		}
		
		private function highlightThumbnail(index:Number):void{
			_thumbView.fisheye.selectedIndex = index;
		}

	}
}