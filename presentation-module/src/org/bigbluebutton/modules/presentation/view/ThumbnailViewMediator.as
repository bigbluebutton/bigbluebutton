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
		
		/**
		 * The defauklt constructor. registers the gui component with this mediator 
		 * @param view
		 * 
		 */		
		public function ThumbnailViewMediator(view:ThumbnailView)
		{
			super(NAME, view);
			thumbnailView.addEventListener(SEND_PAGE_NUM, sendPageNumber);
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

	}
}