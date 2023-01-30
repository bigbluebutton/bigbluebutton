/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2022 BigBlueButton Inc. and by respective authors (see below).
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

public class PlaySoundCommand extends FreeswitchCommand {

    private final String participant;
    private final String soundPath;

    public PlaySoundCommand(String room, String participant, String soundPath, String requesterId) {
            super(room, requesterId);
            this.participant = participant;
            this.soundPath = soundPath;
    }

    @Override
    public String getCommandArgs() {
            String action = "play";

            return room + SPACE + action + SPACE
                + this.soundPath + SPACE + participant;
    }

}
