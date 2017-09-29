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
package org.bigbluebutton.modules.videoconf.maps
{
  import mx.collections.ArrayCollection;
  import mx.collections.ArrayList;
  
  import org.bigbluebutton.core.UsersUtil;
    
  public class WindowManager
  {
    private var webcamWindows:ArrayCollection = new ArrayCollection();
    
    private function get me():String {
      return UsersUtil.getMyUsername();
    }
    
    public function addWindow(window:VideoWindowItf):void {      
      webcamWindows.addItem(window);
      trace("[" + me + "] addWindow:: userID = [" + window.userID + "] numWindows = [" + webcamWindows.length + "]");
    }
    
    public function removeWindow(userID:String):VideoWindowItf {
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        trace("[" + me + "] removeWindow:: [" + win.userID + " == " + userID + "] equal = [" + (win.userID == userID) + "]");
        if (win.userID == userID) {
          return webcamWindows.removeItemAt(i) as VideoWindowItf;
        }
      }      
      
      return null;
    }

    public function removeWin(window:VideoWindowItf):VideoWindowItf {
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        if (win == window) {
          return webcamWindows.removeItemAt(i) as VideoWindowItf;
        }
      }      
      
      return null;
    }
    
    public function hasWindow(userID:String):Boolean {
      trace("[" + me + "] hasWindow:: user [" + userID + "] numWindows = [" + webcamWindows.length + "]");
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        trace("[" + me + "] hasWindow:: [" + win.userID + " == " + userID + "] equal = [" + (win.userID == userID) + "]");
        if (win.userID == userID) {          
          return true;
        }
      }
      
      return false;
    }
    
    public function getWindow(userID:String):VideoWindowItf {
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        trace("[" + me + "] getWindow:: [" + win.userID + " == " + userID + "] equal = [" + (win.userID == userID) + "]");
        if (win.userID == userID) return win;
      }      
      
      return null;      
    }

    public function getAllWindow(userID:String):ArrayList {
      var windowsList:ArrayList = new ArrayList();
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        trace("[" + me + "] getWindow:: [" + win.userID + " == " + userID + "] equal = [" + (win.userID == userID) + "]");
        if (win.userID == userID) windowsList.addItem(win);
      }      
      
      return windowsList;      
    }
  }
}
