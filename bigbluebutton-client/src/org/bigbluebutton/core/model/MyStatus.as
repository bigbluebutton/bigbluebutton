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
package org.bigbluebutton.core.model
{
 
  public class MyStatus {   
    
    // Flag to tell that user is in the process of leaving the meeting.
    public var isLeavingFlag:Boolean = false;
    
    public var disableMyCam:Boolean = false;
    public var disableMyMic:Boolean = false;
    public var disableMyPrivateChat:Boolean = false;
    public var disableMyPublicChat:Boolean = false;
    public var lockedLayout:Boolean = false;
    
    public var iAskedToLogout:Boolean;
    public var userEjectedFromMeeting:Boolean = false;
    public var waitingForAcceptance: Boolean;
    
    public var userLocked: Boolean = false;
    public var voiceJoined: Boolean = false;
    public var voiceMuted: Boolean = false;
    
    public var isPresenter: Boolean = false;
    public var myEmojiStatus: String = "none";
    
  }
}


