/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2023 BigBlueButton Inc. and by respective authors (see below).
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
package org.bigbluebutton.freeswitch.voice.events;

public class ChannelHoldChangedEvent extends VoiceConferenceEvent {

  private final String userId;
  private final String uuid;
  private final boolean hold;

  public ChannelHoldChangedEvent(
      String room, 
      String userId,
      String uuid, 
      boolean hold
  ) {
    super(room);
    this.userId = userId;
    this.uuid = uuid;
    this.hold = hold;
  }

  public String getUserId() {
    return userId;
  }

  public String getUUID() {
    return uuid;
  }

  public boolean isHeld() {
    return hold;
  }

}
