/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2013 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
* author:
*/
package org.bigbluebutton.main.model
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.main.events.RefreshGuestEvent;
	import org.bigbluebutton.main.events.RemoveGuestFromViewEvent;

	public class GuestManager
	{
		private var guest:Guest;
		private var dispatcher:Dispatcher;

		public function GuestManager() {
			this.dispatcher = new Dispatcher();
			this.guest = new Guest();
		}

		public function addGuest(evt:BBBEvent):void {
			guest.addGuest(evt.payload.userId, evt.payload.name);
			refreshGuestView();
		}

		public function refreshGuestView():void {
			if (guest.hasGuest()) {
				var refreshGuestEvent:RefreshGuestEvent = new RefreshGuestEvent();
				refreshGuestEvent.listOfGuests = guest.getGuests();
				dispatcher.dispatchEvent(refreshGuestEvent);
			}
		}

		public function removeAllGuests():void {
			guest.removeAllGuests();
		}

		private function removeGuestFromView(userid:String):void {
			var removeGuestFromViewEvent:RemoveGuestFromViewEvent = new RemoveGuestFromViewEvent();
			removeGuestFromViewEvent.userid = userid;
			dispatcher.dispatchEvent(removeGuestFromViewEvent);
		}

		public function removeGuest(userid:String):void {
			guest.remove(userid);
			removeGuestFromView(userid);
		}
	}
}
