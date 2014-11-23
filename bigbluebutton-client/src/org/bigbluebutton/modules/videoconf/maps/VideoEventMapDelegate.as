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
  import flash.events.IEventDispatcher;
  import flash.media.Camera;  
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
  import org.flexunit.runner.manipulation.filters.IncludeAllFilter;

  public class VideoEventMapDelegate
  {
    private var options:VideoConfOptions = new VideoConfOptions();
    private var uri:String;
    
    private var webcamWindows:WindowManager = new WindowManager();
    
    private var button:ToolbarButton = new ToolbarButton();	
    private var proxy:VideoProxy;
    private var streamName:String;
    
    private var _dispatcher:IEventDispatcher;
    private var _ready:Boolean = false;
    private var _isPublishing:Boolean = false;
	  private var _isPreviewWebcamOpen:Boolean = false;
	  private var _isWaitingActivation:Boolean = false;
    
    public function VideoEventMapDelegate(dispatcher:IEventDispatcher)
    {
      _dispatcher = dispatcher;
    }
    
    private function get me():String {
      return UsersUtil.getMyUsername();
    }
    
    public function start(uri:String):void {
      trace("VideoEventMapDelegate:: [" + me + "] Video Module Started.");
      this.uri = uri;
    }
        
    public function viewCamera(userID:String, stream:String, name:String, mock:Boolean = false):void {
      trace("VideoEventMapDelegate:: [" + me + "] viewCamera. ready = [" + _ready + "]");
      
      if (!_ready) return;
      trace("VideoEventMapDelegate:: [" + me + "] Viewing [" + userID + " stream [" + stream + "]");
      if (! UserManager.getInstance().getConference().amIThisUser(userID)) {
        openViewWindowFor(userID);			
      }      
    }

    public function handleUserLeftEvent(event:UserLeftEvent):void {
      trace("VideoEventMapDelegate:: [" + me + "] handleUserLeftEvent. ready = [" + _ready + "]");
      
      if (!_ready) return;
      
      closeWindow(event.userID);
    }
    
    public function handleUserJoinedEvent(event:UserJoinedEvent):void {
      trace("VideoEventMapDelegate:: [" + me + "] handleUserJoinedEvent. ready = [" + _ready + "]");
      
      if (!_ready) return;
      
      if (options.displayAvatar) {
        openAvatarWindowFor(event.userID);
      }
    }
    
    private function displayToolbarButton():void {
      button.isPresenter = true;
      
      if (options.presenterShareOnly) {
        if (UsersUtil.amIPresenter()) {
          button.isPresenter = true;
        } else { 
          button.isPresenter = false;
        }
      }
            
    }
    
    private function addToolbarButton():void{
      LogUtil.debug("****************** Adding toolbar button. presenter?=[" + UsersUtil.amIPresenter() + "]");
      if (proxy.videoOptions.showButton) {  

        displayToolbarButton();
        
        var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
        event.button = button;
		    event.module="Webcam";
        _dispatcher.dispatchEvent(event);
      }
    }
    
    private function autoStart():void {          
      if (options.skipCamSettingsCheck) {
        skipCameraSettingsCheck();
      } else {
        _dispatcher.dispatchEvent(new ShareCameraRequestEvent());	
      }
    }

    private function changeDefaultCamForMac():Camera {
      for (var i:int = 0; i < Camera.names.length; i++){
        if (Camera.names[i] == "USB Video Class Video") {
          /** Set as default for Macs */
          return Camera.getCamera("USB Video Class Video");
        }
      }
      
      return null;
    }
    
    private function getDefaultResolution(resolutions:String):Array {
      var res:Array = resolutions.split(",");  
      if (res.length > 0) {
        var resStr:Array = (res[0] as String).split("x");
        var resInts:Array = [Number(resStr[0]), Number(resStr[1])];
        return resInts;
      } else {
        return [Number("320"), Number("240")];
      }
    }
        
    private function skipCameraSettingsCheck():void {     
        var cam:Camera = changeDefaultCamForMac();
        if (cam == null) {
          cam = Camera.getCamera();
        }
        
        var videoOptions:VideoConfOptions = new VideoConfOptions();
        
        var resolutions:Array = getDefaultResolution(videoOptions.resolutions);
        var camWidth:Number = resolutions[0];
        var camHeight:Number = resolutions[1];
        trace("Skipping cam check. Using default resolution [" + camWidth + "x" + camHeight + "]");
        cam.setMode(camWidth, camHeight, videoOptions.camModeFps);
        cam.setMotionLevel(5, 1000);
        cam.setKeyFrameInterval(videoOptions.camKeyFrameInterval);
        
        cam.setQuality(videoOptions.camQualityBandwidth, videoOptions.camQualityPicture);
        initCameraWithSettings(cam.index, cam.width, cam.height);     
    }
    
    private function openWebcamWindows():void {
      trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindows:: ready = [" + _ready + "]");
      
      var uids:ArrayCollection = UsersUtil.getUserIDs();
      
      for (var i:int = 0; i < uids.length; i++) {
        var u:String = uids.getItemAt(i) as String;
        trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindows:: open window for = [" + u + "]");
        openWebcamWindowFor(u); 
      }
    }
    
    private function openWebcamWindowFor(userID:String):void {      
      trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: open window for = [" + userID + "]");
      if (! UsersUtil.isMe(userID) && UsersUtil.hasWebcamStream(userID)) {
        trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: Not ME and user = [" + userID + "] is publishing.");
        
        if (webcamWindows.hasWindow(userID)) {
          trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: user = [" + userID + "] has a window open. Close it.");
          closeWindow(userID);
        }
        trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: View user's = [" + userID + "] webcam.");
        openViewWindowFor(userID);
      } else {
        if (UsersUtil.isMe(userID) && options.autoStart) {
          trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: It's ME and AutoStart. Start publishing.");
          autoStart();
        } else {
          if (options.displayAvatar) {
            trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: It's NOT ME and NOT AutoStart. Open Avatar for user = [" + userID + "]");
            openAvatarWindowFor(userID);              
          } else {
            trace("VideoEventMapDelegate:: [" + me + "] openWebcamWindowFor:: Is THERE another option for user = [" + userID + "]");
          }
        }
      }
    }
    
    private function openAvatarWindowFor(userID:String):void {      
      if (! UsersUtil.hasUser(userID)) return;
      
      var window:AvatarWindow = new AvatarWindow();
      window.userID = userID;
      window.title = UsersUtil.getUserName(userID);
     
      trace("VideoEventMapDelegate:: [" + me + "] openAvatarWindowFor:: Closing window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      closeWindow(userID);
            
      webcamWindows.addWindow(window);        
      
      trace("VideoEventMapDelegate:: [" + me + "] openAvatarWindowFor:: Opening AVATAR window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
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
      

      trace("VideoEventMapDelegate:: [" + me + "] openPublishWindowFor:: Closing window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      closeWindow(userID);

      webcamWindows.addWindow(publishWindow);
      
      trace("VideoEventMapDelegate:: [" + me + "] openPublishWindowFor:: Opening PUBLISH window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
      openWindow(publishWindow);     
      dockWindow(publishWindow);  
    }
    
    private function closeWindow(userID:String):void {
      if (! webcamWindows.hasWindow(userID)) {
        trace("VideoEventMapDelegate:: [" + me + "] closeWindow:: No window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
        return;
      }
      
      var win:VideoWindowItf = webcamWindows.removeWindow(userID);
      if (win != null) {
        trace("VideoEventMapDelegate:: [" + me + "] closeWindow:: Closing [" + win.getWindowType() + "] for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
        win.close();
        var cwe:CloseWindowEvent = new CloseWindowEvent();
        cwe.window = win;
        _dispatcher.dispatchEvent(cwe);
      } else {
        trace("VideoEventMapDelegate:: [" + me + "] closeWindow:: Not Closing. No window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      }
    }
    
    private function openViewWindowFor(userID:String):void {
      trace("VideoEventMapDelegate:: [" + me + "] openViewWindowFor:: Opening VIEW window for [" + userID + "] [" + UsersUtil.getUserName(userID) + "]");
      
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
      proxy = new VideoProxy(uri);
      proxy.connect();
    }
    
    public function startPublishing(e:StartBroadcastEvent):void{
	  LogUtil.debug("VideoEventMapDelegate:: [" + me + "] startPublishing:: Publishing stream to: " + proxy.connection.uri + "/" + e.stream);
      streamName = e.stream;
      proxy.startPublishing(e);
      
	  _isWaitingActivation = false;
      _isPublishing = true;
      UsersUtil.setIAmPublishing(true);
      
      var broadcastEvent:BroadcastStartedEvent = new BroadcastStartedEvent();
      broadcastEvent.stream = e.stream;
      broadcastEvent.userid = UsersUtil.getMyUserID();
      broadcastEvent.isPresenter = UsersUtil.amIPresenter();
      broadcastEvent.camSettings = UsersUtil.amIPublishing();
      
      _dispatcher.dispatchEvent(broadcastEvent);
	  if (proxy.videoOptions.showButton) {
		  button.publishingStatus(button.START_PUBLISHING);
	  }
    }
       
    public function stopPublishing(e:StopBroadcastEvent):void{
      trace("VideoEventMapDelegate:: [" + me + "] Stop publishing. ready = [" + _ready + "]"); 
      stopBroadcasting();    
    }
    
    private function stopBroadcasting():void {
      trace("Stopping broadcast of webcam");
      
      proxy.stopBroadcasting();
      
      _isPublishing = false;
      UsersUtil.setIAmPublishing(false);
      var broadcastEvent:BroadcastStoppedEvent = new BroadcastStoppedEvent();
      broadcastEvent.stream = streamName;
      broadcastEvent.userid = UsersUtil.getMyUserID();
      broadcastEvent.avatarURL = UsersUtil.getAvatarURL();
      _dispatcher.dispatchEvent(broadcastEvent);
      
      
	  
	  if (proxy.videoOptions.showButton) {
		  //Make toolbar button enabled again
		  button.publishingStatus(button.STOP_PUBLISHING);
	  }
      
      closeWindow(UsersUtil.getMyUserID());
      
      if (options.displayAvatar) {
        trace("VideoEventMapDelegate:: [" + me + "] Opening avatar");
        openAvatarWindowFor(UsersUtil.getMyUserID());              
      }      
    }
    
    public function handleClosePublishWindowEvent(event:ClosePublishWindowEvent):void {
			trace("Closing publish window");
      if (_isPublishing) {
        stopBroadcasting();
      }
			trace("Resetting flags for publish window.");
			// Reset flags to determine if we are publishing or previewing webcam.
			_isPublishing = false;
			_isWaitingActivation = false;
    }
    
    public function handleShareCameraRequestEvent(event:ShareCameraRequestEvent):void {     
      if (options.skipCamSettingsCheck) {
        skipCameraSettingsCheck();
      } else {
    	  trace("Webcam: "+_isPublishing + " " + _isPreviewWebcamOpen + " " + _isWaitingActivation);
    	  if (!_isPublishing && !_isPreviewWebcamOpen && !_isWaitingActivation) {
          openWebcamPreview(event.publishInClient);
        }   			
      }
    }
	
	public function handleCamSettingsClosedEvent(event:BBBEvent):void{
		_isPreviewWebcamOpen = false;
	}
    
    private function openWebcamPreview(publishInClient:Boolean):void {
      var openEvent:BBBEvent = new BBBEvent(BBBEvent.OPEN_WEBCAM_PREVIEW);
      openEvent.payload.publishInClient = publishInClient;
      openEvent.payload.resolutions = options.resolutions;
      
	  _isPreviewWebcamOpen = true;
	  
      _dispatcher.dispatchEvent(openEvent);
    }
    
    public function stopModule():void {
      trace("VideoEventMapDelegate:: stopping video module");
      closeAllWindows();
      proxy.disconnect();
    }
    
    public function closeAllWindows():void{
      trace("VideoEventMapDelegate:: closing all windows");
      if (_isPublishing) {
        stopBroadcasting();
      }
      
      _dispatcher.dispatchEvent(new CloseAllWindowsEvent());
    }
    
    public function switchToPresenter(event:MadePresenterEvent):void{
      trace("VideoEventMapDelegate:: [" + me + "] Got Switch to presenter event. ready = [" + _ready + "]");
           
      if (options.showButton) {
        displayToolbarButton();
      }  
    }
        
    public function switchToViewer(event:MadePresenterEvent):void{
      trace("VideoEventMapDelegate:: [" + me + "] Got Switch to viewer event. ready = [" + _ready + "]");
                  
      if (options.showButton){
        LogUtil.debug("****************** Switching to viewer. Show video button?=[" + UsersUtil.amIPresenter() + "]");
        displayToolbarButton();
        if (_isPublishing && options.presenterShareOnly) {
          stopBroadcasting();
        }
      }
    }
    
    public function connectedToVideoApp():void{
      trace("VideoEventMapDelegate:: [" + me + "] Connected to video application.");
      _ready = true;
      addToolbarButton();
      openWebcamWindows();        
    }
    
    public function handleCameraSetting(event:BBBEvent):void {      
      var cameraIndex:int = event.payload.cameraIndex;
      var camWidth:int = event.payload.cameraWidth;
      var camHeight:int = event.payload.cameraHeight;     
      trace("VideoEventMapDelegate::handleCameraSettings [" + cameraIndex + "," + camWidth + "," + camHeight + "]");
      initCameraWithSettings(cameraIndex, camWidth, camHeight);
    }
    
    private function initCameraWithSettings(camIndex:int, camWidth:int, camHeight:int):void {
      var camSettings:CameraSettingsVO = new CameraSettingsVO();
      camSettings.camIndex = camIndex;
      camSettings.camWidth = camWidth;
      camSettings.camHeight = camHeight;
      
      UsersUtil.setCameraSettings(camSettings);
      
      _isWaitingActivation = true;
      openPublishWindowFor(UsersUtil.getMyUserID(), camIndex, camWidth, camHeight);       
    }
    
    public function handleStoppedViewingWebcamEvent(event:StoppedViewingWebcamEvent):void {
      trace("VideoEventMapDelegate::handleStoppedViewingWebcamEvent [" + me + "] received StoppedViewingWebcamEvent for user [" + event.webcamUserID + "]");
      
      closeWindow(event.webcamUserID);
            
      if (options.displayAvatar && UsersUtil.hasUser(event.webcamUserID) && ! UsersUtil.isUserLeaving(event.webcamUserID)) {
        trace("VideoEventMapDelegate::handleStoppedViewingWebcamEvent [" + me + "] Opening avatar for user [" + event.webcamUserID + "]");
        openAvatarWindowFor(event.webcamUserID);              
      }        
    }
  }
}
