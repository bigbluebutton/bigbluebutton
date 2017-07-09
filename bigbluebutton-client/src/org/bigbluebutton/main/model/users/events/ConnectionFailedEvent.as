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
package org.bigbluebutton.main.model.users.events
{
    import flash.events.Event;

    public class ConnectionFailedEvent extends Event {
        public static const UNKNOWN_REASON:String = "unknownReason";
        public static const CONNECTION_FAILED:String = "connectionFailed";
        public static const CONNECTION_CLOSED:String = "connectionClosed";
        public static const CONNECTION_ATTEMPT_TIMEDOUT:String = "connectionAttemptTimedout";
        public static const INVALID_APP:String = "invalidApp";
        public static const APP_SHUTDOWN:String = "appShutdown";
        public static const CONNECTION_REJECTED:String = "connectionRejected";
        public static const ASYNC_ERROR:String = "asyncError";
        public static const USER_LOGGED_OUT:String = "userHasLoggedOut";
        public static const USER_EJECTED_FROM_MEETING:String = "userHasBeenEjectFromMeeting";
        public static const MODERATOR_DENIED_ME:String = "moderatorDeniedMe";

        public function ConnectionFailedEvent(type:String) {
            super(type, true, false);
        }
    }
}