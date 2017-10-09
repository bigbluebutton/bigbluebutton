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

package org.bigbluebutton.api.domain;

import java.util.concurrent.atomic.AtomicInteger;

public class UserSession {
  public String authToken = null;
  public String internalUserId = null;
  public String conferencename = null;
  public String meetingID = null;
  public String externMeetingID = null;
  public String externUserID = null;
  public String fullname = null; 
  public String role = null;
  public String conference = null;
  public String room = null;
  public Boolean guest = false;
  public Boolean authed = false;
  public String voicebridge = null;
  public String webvoiceconf = null;
  public String mode = null;
  public String record = null;
  public String welcome = null;
  public String logoutUrl = null;
  public String defaultLayout = "NOLAYOUT";
  public String avatarURL;
  public String configXML;
  public String guestStatus = GuestPolicy.ALLOW;
  private AtomicInteger connections = new AtomicInteger(0);
  
 
  public synchronized int incrementConnectionNum() {
    return connections.incrementAndGet();
  }
  
  
}
