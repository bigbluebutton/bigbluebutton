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
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.MadePresenterEvent;
  import org.bigbluebutton.main.events.StoppedViewingWebcamEvent;
  import org.bigbluebutton.main.events.UserJoinedEvent;
  import org.bigbluebutton.main.events.UserLeftEvent;
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
    private var _ready:Boolean = false;
    private var _isPublishing:Boolean = false;
    
    public function VideoEventMapDelegate(dispatcher:IEventDispatcher)
    {
      _dispatcher = dispatcher;
    }
    
    private function get me():String {
      return UsersUtil.getMyUsername();
    }
    
    public function start():void {
      trace("[" + me + "] Video Module Started.");
    }
    
    public function stop():void {
      
    }
    
    public function viewCamera(userID:String, stream:String, name:String, mock:Boolean = false):void {
      trace("[" + me + "] viewCamera. ready = [" + _ready + "]");
      
      if (!_ready) return;
      trace("[" + me + "] Viewing [" + userID + " stream [" + stream + "]");
      if (! UserManager.getInstance().getConference().amIThisUser(userID)) {
        openViewWindowFor(userID);			
      }      
    }

    public function handleUserLeftEvent(event:UserLeftEvent):void {
      trace("[" + me + "] handleUserLeftEvent. ready = [" + _ready + "]");
      
      if (!_ready) return;
      
      closeWindow(event.userID);
    }
    
    public function handleUserJoinedEvent(event:UserJoinedEvent):void {
      trace("[" + me + "] handleUserJoinedEvent. ready = [" + _ready + "]");
      
      if (!_ready) return;
      
      if (options.displayAvatar) {
        openAvatarWindowFor(event.userID);
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
      trace("[" + me + "] openWebcamWindows:: ready = [" + _ready + "]");
      
      var uids:ArrayCollection = UsersUtil.getUserIDs();
      
      for (var i:int = 0; i < uids.length; i++) {
        var u:String = uids.getItemAt(i) as String;
        trace("[" + me + "] openWebcamWindows:: open window for = [" + u + "]");
        openWebcamWindowFor(u); 
      }
    }
    
    private function openWebcamWindowFor(userID:String):void {      
      trace("[" + me + "] openWebcamWindowFor:: open window for = [" + userID + "]");
      if (! UsersUtil.isMe(userID) && UsersUtil.hasWebcamStream(userID)) {
        trace("[" + me + "] openWebcamWindowFor:: Not ME and user = [" + userID + "] is publishing.");
        
        if (webcamWindows.hasWindow(userID)) {
          trace("[" + me + "] openWebcamWindowFor:: user = [" + userID + "] has a window open. Close it.");
          closeWindow(userID);
        }
        trace("[" + me + "] openWebcamWindowFor:: View user's = [" + userID + "] webcam.");
        openViewWindowFor(userID);
      } else {
        if (UsersUtil.isMe(userID) && options.autoStart) {
          trace("[" + me + "] openWebcamWindowFor:: It's ME and AutoStart. Start publishing.");
          autoStart();
        } else {
          if (options.displayAvatar) {
            trace("[" + me + "] openWebcamWindowFor:: It's NOT ME and NOT AutoStart. Open Avatar for user = [" + userID + "]");
            openAvatarWindowFor(userID);              
          } else {
            trace("[" + me + "] openWebcamWindowFor:: Is THERE another option for user = [" + userID + "]");
          }
        }
      }
    }
    
    private function openAvatarWindowFor(userID:String):void {      
      var window:AvatarWindow = new AvatarWindow();
      window.userID = userID;
      window.title = UsersUtil.getUserName(userID);
     
      trace("[" + me + "] openAvatarWindowFor:: Closing window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      closeWindow(userID);
            
      webcamWindows.addWindow(window);        
      
      trace("[" + me + "] openAvatarWindowFor:: Opening AVATAR window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
      openWindow(window);
      dockWindow(window);          
    }
    
    private function openPublishWindowFor(userID:String, camIndex:int, camWidth:int, camHeight:int):void {
      var publishWindow:PublishWindow = new PublishWindow();
      publishWindow.userID = userID;
      publishWindow.title = UsersUtil.getUserName(userID);
      publishWindow.camIndex = camIndex;
      publishWindow.setResolution(camWidth, camHeight);
      publishWindow.videoOptions = options;
      publishWindow.quality = options.videoQuality;
      publishWindow.resolutions = options.resolutions.split(",");
      

      trace("[" + me + "] openPublishWindowFor:: Closing window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      closeWindow(userID);

      webcamWindows.addWindow(publishWindow);
      
      trace("[" + me + "] openPublishWindowFor:: Opening PUBLISH window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
      openWindow(publishWindow);     
      dockWindow(publishWindow);  
    }
    
    private function closeWindow(userID:String):void {
      if (! webcamWindows.hasWindow(userID)) {
        trace("[" + me + "] closeWindow:: No window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
        return;
      }
      
      var win:VideoWindowItf = webcamWindows.removeWindow(userID);
      if (win != null) {
        trace("[" + me + "] closeWindow:: Closing [" + win.getWindowType() + "] for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
        win.close();
        var cwe:CloseWindowEvent = new CloseWindowEvent();
        cwe.window = win;
        _dispatcher.dispatchEvent(cwe);
      } else {
        trace("[" + me + "] closeWindow:: Not Closing. No window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      }
    }
    
    private function openViewWindowFor(userID:String):void {
      trace("[" + me + "] openViewWindowFor:: Opening VIEW window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
      var window:VideoWindow = new VideoWindow();
      window.userID = userID;
      window.videoOptions = options;       
      window.resolutions = options.resolutions.split(",");
      window.title = UsersUtil.getUserName(userID);
      
      closeWindow(userID);
            
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
      LogUtil.debug("[" + me + "] startPublishing:: Publishing stream to: " + proxy.connection.uri + "/" + e.stream);
      streamName = e.stream;
      proxy.startPublishing(e);
      
      _isPublishing = true;
      UsersUtil.setIAmPublishing(true);
      
      var broadcastEvent:BroadcastStartedEvent = new BroadcastStartedEvent();
      broadcastEvent.stream = e.stream;
      broadcastEvent.userid = UsersUtil.getMyUserID();
      _dispatcher.dispatchEvent(broadcastEvent);
      button.publishingStatus(button.START_PUBLISHING);
    }
       
    public function stopPublishing(e:StopBroadcastEvent):void{
      trace("[" + me + "] Stop publishing. ready = [" + _ready + "]"); 
      stopBroadcasting();    
    }
    
    private function stopBroadcasting():void {
      proxy.stopBroadcasting();
      
      _isPublishing = false;
      UsersUtil.setIAmPublishing(false);
      var broadcastEvent:BroadcastStoppedEvent = new BroadcastStoppedEvent();
      broadcastEvent.stream = streamName;
      broadcastEvent.userid = UsersUtil.getMyUserID();
      _dispatcher.dispatchEvent(broadcastEvent);
      
      //Make toolbar button enabled again
      button.publishingStatus(button.STOP_PUBLISHING);
      
      closeWindow(UsersUtil.getMyUserID());
      
      if (options.displayAvatar) {
        trace("[" + me + "] Opening avatar");
        openAvatarWindowFor(UsersUtil.getMyUserID());              
      }      
    }
    
    public function handleClosePublishWindowEvent(event:ClosePublishWindowEvent):void {
      if (_isPublishing) {
        stopBroadcasting();
      }
    }
    
    public function handleShareCameraRequestEvent(event:ShareCameraRequestEvent):void {
      openWebcamPreview(event.publishInClient);
    }
    
    private function openWebcamPreview(publishInClient:Boolean):void {
      var openEvent:BBBEvent = new BBBEvent(BBBEvent.OPEN_WEBCAM_PREVIEW);
      openEvent.payload.publishInClient = publishInClient;
      openEvent.payload.resolutions = options.resolutions;
      
      _dispatcher.dispatchEvent(openEvent);      
    }
    
    public function stopModule():void {
      closeAllWindows();
      proxy.disconnect();
    }
    
    public function closeAllWindows():void{
      if (_isPublishing) {
        stopBroadcasting();
      }
      
      _dispatcher.dispatchEvent(new CloseAllWindowsEvent());
    }
    
    public function switchToPresenter(event:MadePresenterEvent):void{
      trace("[" + me + "] Got Switch to presenter event. ready = [" + _ready + "]");
      
      if (!_ready) return;
           
      if (options.presenterShareOnly){
        button.isPresenter = true;
      }
    }
    
    public function switchToViewer(event:MadePresenterEvent):void{
      trace("[" + me + "] Got Switch to viewer event. ready = [" + _ready + "]");
      
      if (!_ready) return;
            
      if (options.presenterShareOnly){
        button.isPresenter = false;
        if (_isPublishing) {
          stopBroadcasting();
        }
      }
    }
    
    public function connectedToVideoApp():void{
      trace("[" + me + "] Connected to video application.");
      _ready = true;
      addToolbarButton();
      openWebcamWindows();        
    }
    
    public function handleCameraSetting(event:BBBEvent):void {      
      var cameraIndex:int = event.payload.cameraIndex;
      var camWidth:int = event.payload.cameraWidth;
      var camHeight:int = event.payload.cameraHeight;     
      
      var camSettings:CameraSettingsVO = new CameraSettingsVO();
      camSettings.camIndex = cameraIndex;
      camSettings.camWidth = camWidth;
      camSettings.camHeight = camHeight;
      
      UsersUtil.setCameraSettings(camSettings);
      
      openPublishWindowFor(UsersUtil.getMyUserID(), cameraIndex, camWidth, camHeight);       
    }
    
    public function handleStoppedViewingWebcamEvent(event:StoppedViewingWebcamEvent):void {
      closeWindow(event.webcamUserID);
            
      if (options.displayAvatar) {
        trace("[" + me + "] Opening avatar");
        openAvatarWindowFor(event.webcamUserID);              
      }        
    }
  }
}