package org.bigbluebutton.modules.videoconf.maps
{
  import flash.events.IEventDispatcher;  
  import mx.collections.ArrayCollection;  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.common.events.CloseWindowEvent;
  import org.bigbluebutton.common.events.OpenWindowEvent;
  import org.bigbluebutton.common.events.ToolbarButtonEvent;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.ConnectAppEvent;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.StoppedViewingWebcamEvent;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.main.model.users.events.BroadcastStartedEvent;
  import org.bigbluebutton.main.model.users.events.BroadcastStoppedEvent;
  import org.bigbluebutton.main.model.users.events.StreamStartedEvent;
  import org.bigbluebutton.modules.videoconf.business.VideoProxy;
  import org.bigbluebutton.modules.videoconf.business.VideoWindowItf;
  import org.bigbluebutton.modules.videoconf.events.CloseAllWindowsEvent;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.ConnectedEvent;
  import org.bigbluebutton.modules.videoconf.events.OpenVideoWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.ShareCameraRequestEvent;
  import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
  import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;
  import org.bigbluebutton.modules.videoconf.model.VideoConfOptions;
  import org.bigbluebutton.modules.videoconf.views.AvatarWindow;
  import org.bigbluebutton.modules.videoconf.views.PublishWindow;
  import org.bigbluebutton.modules.videoconf.views.ToolbarButton;
  import org.bigbluebutton.modules.videoconf.views.VideoWindow;
  import org.bigbluebutton.modules.viewers.events.ViewCameraEvent;
  import org.flexunit.runner.manipulation.filters.IncludeAllFilter;
  
  public class VideoEventMapDelegate
  {
    private var options:VideoConfOptions = new VideoConfOptions();
    private var webcamWindows:WindowManager = new WindowManager();
    
    private var button:ToolbarButton;
    private var proxy:VideoProxy;
    private var streamName:String;
    
    private var _dispatcher:IEventDispatcher;
    
    public function VideoEventMapDelegate(dispatcher:IEventDispatcher)
    {
      _dispatcher = dispatcher;
    }
    
    public function start():void {
      trace("Video Module Started.");
    }
    
    public function stop():void {
      
    }
    
    public function viewCamera(userID:String, stream:String, name:String, mock:Boolean = false):void {
      LogUtil.debug("Viewing [" + userID + " stream [" + stream + "]");
      if (! UserManager.getInstance().getConference().amIThisUser(userID)) {
        openViewWindowFor(userID);			
      }      
    }
    
    private function addToolbarButton():void{
      if (proxy.videoOptions.showButton) {
        button = new ToolbarButton();	  
        button.isPresenter = !options.presenterShareOnly;
        var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
        event.button = button;
        _dispatcher.dispatchEvent(event);
      }
    }
    
    private function autoStart():void {       
      _dispatcher.dispatchEvent(new ShareCameraRequestEvent());					       
    }
    
    private function openWebcamWindows():void {
      var uids:ArrayCollection = UsersUtil.getUserIDs();
      
      for (var i:int = 0; i < uids.length; i++) {
        var u:String = uids.getItemAt(i) as String;
        openWebcamWindowFor(u); 
      }
    }
    
    private function openWebcamWindowFor(userID:String):void {       
      if (! UsersUtil.isMe(userID) && UsersUtil.hasWebcamStream(userID)) {
        if (webcamWindows.hasWindow(userID)) {
          closeWindow(userID);
        }
        openViewWindowFor(userID);
      } else {
        if (UsersUtil.isMe(userID) && options.autoStart) {
          autoStart();
        } else {
          if (options.displayAvatar) {
            openAvatarWindowFor(userID);              
          }
        }
      }
    }
    
    private function openAvatarWindowFor(userID:String):void {      
      var window:AvatarWindow = new AvatarWindow();
      window.userID = userID;
      window.title = UsersUtil.getUserName(userID);
      
      webcamWindows.addWindow(window);        
      trace("Opening AVATAR window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
      openWindow(window);
      dockWindow(window);          
    }
    
    private function openPublishWindowFor(userID:String, camIndex:int, camWidth:int, camHeight:int):void {
      var publishWindow:PublishWindow = new PublishWindow();
      publishWindow.userID = userID;
      publishWindow.camIndex = camIndex;
      publishWindow.setResolution(camWidth, camHeight);
      publishWindow.videoOptions = proxy.videoOptions;
      publishWindow.quality = options.videoQuality;
      publishWindow.resolutions = options.resolutions.split(",");
      
      if (webcamWindows.hasWindow(userID)) {
        trace("Closing window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
        closeWindow(userID);
      }
      webcamWindows.addWindow(publishWindow);
      
      trace("Opening PUBLISH window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
      openWindow(publishWindow);     
      dockWindow(publishWindow);  
    }
    
    private function closeWindow(userID:String):void {
      var win:VideoWindowItf = webcamWindows.removeWindow(userID);
      if (win != null) {
        trace("Closing [" + win.getWindowType() + "] for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
        win.close();
      }
    }
    
    private function openViewWindowFor(userID:String):void {
      var window:VideoWindow = new VideoWindow();
      window.userID = userID;
      window.videoOptions = options;       
      window.resolutions = options.resolutions.split(",");
      window.title = UsersUtil.getUserName(userID);
      
      var bbbUser:BBBUser = UsersUtil.getUser(userID);
      window.startVideo(proxy.connection, bbbUser.streamName);
      
      webcamWindows.addWindow(window);        
      openWindow(window);
      dockWindow(window);  
    }
    
    private function openWindow(window:VideoWindowItf):void {
      var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
      windowEvent.window = window;
      _dispatcher.dispatchEvent(windowEvent);      
    }
    
    private function dockWindow(window:VideoWindowItf):void {
      // this event will dock the window, if it's enabled
      var openVideoEvent:OpenVideoWindowEvent = new OpenVideoWindowEvent();
      openVideoEvent.window = window;
      _dispatcher.dispatchEvent(openVideoEvent);         
    }
    
    public function connectToVideoApp():void {
      proxy = new VideoProxy(options.uri + "/" + UsersUtil.getInternalMeetingID());
      proxy.connect();
    }
    
    public function startPublishing(e:StartBroadcastEvent):void{
      LogUtil.debug("Publishing stream to: " + proxy.connection.uri + "/" + e.stream);
      streamName = e.stream;
      proxy.startPublishing(e);
      var broadcastEvent:BroadcastStartedEvent = new BroadcastStartedEvent();
      broadcastEvent.stream = e.stream;
      broadcastEvent.userid = UsersUtil.getMyUserID();
      _dispatcher.dispatchEvent(broadcastEvent);
      button.publishingStatus(button.START_PUBLISHING);
    }
       
    public function stopPublishing(e:StopBroadcastEvent):void{
      trace("Stop publishing");
      proxy.stopBroadcasting();
      
      var broadcastEvent:BroadcastStoppedEvent = new BroadcastStoppedEvent();
      broadcastEvent.stream = streamName;
      broadcastEvent.userid = UsersUtil.getMyUserID();
      _dispatcher.dispatchEvent(broadcastEvent);
      
      //Make toolbar button enabled again
      button.publishingStatus(button.STOP_PUBLISHING);
      
      if (webcamWindows.hasWindow(UsersUtil.getMyUserID())) {
        var win:VideoWindowItf = webcamWindows.removeWindow(UsersUtil.getMyUserID());
        if (win != null) {
          trace("Closing [" + win.getWindowType() + "] for [" + UsersUtil.getMyUserID() + "] [" + UsersUtil.getUserName(UsersUtil.getMyUserID()) + "]");
          var cwe:CloseWindowEvent = new CloseWindowEvent();
          cwe.window = win;
          _dispatcher.dispatchEvent(cwe);
        }
      }
      
      if (options.displayAvatar) {
        trace("Opening avatar");
        openAvatarWindowFor(UsersUtil.getMyUserID());              
      }        
    }
    
    public function handleShareCameraRequestEvent(event:ShareCameraRequestEvent):void {
      openWebcamPreview();
    }
    
    private function openWebcamPreview():void {
      var openEvent:BBBEvent = new BBBEvent(BBBEvent.OPEN_WEBCAM_PREVIEW);
      openEvent.payload.resolutions = options.resolutions;
      
      _dispatcher.dispatchEvent(openEvent);      
    }
    
    public function stopModule():void {
      closeAllWindows();
      proxy.disconnect();
    }
    
    public function closeAllWindows():void{
      //				if (publishWindow != null) {
      //					proxy.stopBroadcasting();
      //					publishWindow.close();
      //				}
      _dispatcher.dispatchEvent(new CloseAllWindowsEvent());
    }
    
    public function switchToPresenter(event:MadePresenterEvent):void{
      trace("Got Switch to presenter event.");
      if (options.presenterShareOnly){
        button.isPresenter = true;
      }
    }
    
    public function switchToViewer(event:MadePresenterEvent):void{
      trace("Got Switch to viewer event.");
      if (options.presenterShareOnly){
        button.isPresenter = false;
        //					if (publishWindow != null) publishWindow.close();
      }
    }
    
    public function connectedToVideoApp():void{
      addToolbarButton();
      openWebcamWindows();        
    }
    
    public function handleCameraSetting(event:BBBEvent):void {      
      var cameraIndex:int = event.payload.cameraIndex;
      var camWidth:int = event.payload.cameraWidth;
      var camHeight:int = event.payload.cameraHeight;     
      openPublishWindowFor(UsersUtil.getMyUserID(), cameraIndex, camWidth, camHeight);       
    }
    
    public function handleStoppedViewingWebcamEvent(event:StoppedViewingWebcamEvent):void {
      if (webcamWindows.hasWindow(event.webcamUserID)) {
        var win:VideoWindowItf = webcamWindows.removeWindow(event.webcamUserID);
        if (win != null) {
          trace("Closing [" + win.getWindowType() + "] for [" + event.webcamUserID + "] [" + UsersUtil.getUserName(event.webcamUserID) + "]");
          var cwe:CloseWindowEvent = new CloseWindowEvent();
          cwe.window = win;
          _dispatcher.dispatchEvent(cwe);
        }
      }
      
      if (options.displayAvatar) {
        trace("Opening avatar");
        openAvatarWindowFor(event.webcamUserID);              
      }        
    }
  }
}