/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2017 BigBlueButton Inc. and by respective authors (see below).
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

package org.bigbluebutton.modules.present.events
{

    import flash.events.Event;

    public class SetPresenterInPodReqEvent extends Event {
        public static const SET_PRESENTER_IN_POD_REQ:String = "SET_PRESENTER_IN_POD_REQ";

        public var podId: String;
        public var nextPresenterId: String;

        public function SetPresenterInPodReqEvent(podId :String, nextPresenterId: String) {
            super(SET_PRESENTER_IN_POD_REQ, true, false);
            this.podId = podId;
            this.nextPresenterId = nextPresenterId;
        }

    }
}
