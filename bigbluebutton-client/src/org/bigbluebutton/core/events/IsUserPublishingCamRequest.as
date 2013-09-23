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
package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class IsUserPublishingCamRequest extends Event
  {
    public static const IS_USER_PUBLISHING_CAM_REQ:String = "is user publishing webcam request event";
      
    public var userID:String;
    
    public function IsUserPublishingCamRequest(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(IS_USER_PUBLISHING_CAM_REQ, bubbles, cancelable);
    }
  }
}