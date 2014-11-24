/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.clientcheck.view.mainview
{
	import flash.events.MouseEvent;
	import flash.external.ExternalInterface;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class RefreshButtonMediator extends Mediator
	{
		[Inject]
		public var view: IRefreshButton;
		
		/**
		 * Initialize listener
		 */
		override public function initialize():void
		{
			(view as RefreshButton).addEventListener(MouseEvent.CLICK, mouseClickHandler);
		}
		
		/**
		 * Handle events to refresh web page
		 */
		private function mouseClickHandler(e:MouseEvent):void
		{
			var pageURL:String = ExternalInterface.call('window.location.href.toString');
			navigateToURL(new URLRequest(pageURL), "_self");
		}
	}
}