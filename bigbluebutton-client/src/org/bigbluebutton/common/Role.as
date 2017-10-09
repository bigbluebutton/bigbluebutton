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
package org.bigbluebutton.common
{
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  
  public class Role
  {
    private static const LOGGER:ILogger = getClassLogger(Role);
    
    public static const VIEWER:String = "VIEWER";
    public static const PRESENTER:String = "PRESENTER";
    public static const MODERATOR:String = "MODERATOR";
    public static const VOICE_ONLY:String = "VOICE_ONLY";
    
    private static var userrole:String;
    
    [Bindable] public static var isPresenter:Boolean;
    
    /**
     * Set the role of the user, with the role being one of the constants defined in this class. 
     * @param role
     * 
     */		
    public static function setRole(role:String):void{
      if (role == VIEWER){
        Role.userrole = VIEWER;
        Role.isPresenter = false;
      } else if (role == MODERATOR){
        Role.userrole = MODERATOR;
      } else if (role == PRESENTER){
        Role.userrole = PRESENTER;
        Role.isPresenter = true;
      }
    }
    
  }
}