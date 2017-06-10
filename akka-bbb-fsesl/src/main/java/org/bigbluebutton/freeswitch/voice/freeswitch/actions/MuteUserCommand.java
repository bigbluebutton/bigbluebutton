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
package org.bigbluebutton.freeswitch.voice.freeswitch.actions;

public class MuteUserCommand extends FreeswitchCommand {
	
    private final String participant;
    private final Boolean mute;

    public MuteUserCommand(String room, String participant, Boolean mute, String requesterId) {
            super(room, requesterId);
            this.participant = participant;
            this.mute = mute;
    }

    @Override
    public String getCommandArgs() {
            String action = "unmute";
            if (mute) action = "mute";

            return room + SPACE + action + SPACE + participant;
    }

}
