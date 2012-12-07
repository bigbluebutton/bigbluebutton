package org.bigbluebutton.modules.videoconf.maps
{
  import flash.media.Video;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.modules.videoconf.business.VideoWindowItf;
  import org.bigbluebutton.modules.videoconf.views.AvatarWindow;
    
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
  }
}