package org.bigbluebutton.modules.videoconf.maps
{
  import flash.media.Video;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.videoconf.business.VideoWindowItf;
  
  
  public class WindowManager
  {
    private var webcamWindows:ArrayCollection = new ArrayCollection();
    
    public function addWindow(userID:String):VideoWindowItf {      
      var win:VideoWindowItf = new VideoWindowItf();
      win.userID = userID;
      webcamWindows.addItem(win);
      
      return win;
    }
    
    public function removeWindow(userID:String):VideoWindowItf {
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.removeItemAt(i) as VideoWindowItf;
        if (win.userID == userID) return win;
      }      
      
      return null;
    }
    
    public function hasWindow(userID:String):Boolean {
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        if (win.userID == userID) return true;
      }
      
      return false;
    }
    
    public function getWindow(userID:String):VideoWindowItf {
      for (var i:int = 0; i < webcamWindows.length; i++) {
        var win:VideoWindowItf = webcamWindows.getItemAt(i) as VideoWindowItf;
        if (win.userID == userID) return win;
      }      
      
      return null;      
    }
  }
}