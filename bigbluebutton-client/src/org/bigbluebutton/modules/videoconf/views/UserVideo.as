package org.bigbluebutton.modules.videoconf.views
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.AsyncErrorEvent;
  import flash.events.NetStatusEvent;
  import flash.filters.ConvolutionFilter;
  import flash.net.NetConnection;
  import flash.net.NetStream;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.VideoProfile;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.StartedViewingWebcamEvent;
  import org.bigbluebutton.main.events.StoppedViewingWebcamEvent;
  import org.bigbluebutton.main.views.VideoWithWarnings;
  import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
  import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;

  public class UserVideo extends UserGraphic {
	private static const LOGGER:ILogger = getClassLogger(UserVideo);      

    protected var _camIndex:int = -1;

    protected var _ns:NetStream;

    protected var _shuttingDown:Boolean = false;
    protected var _streamName:String;
    protected var _video:VideoWithWarnings = null;
    protected var _videoProfile:VideoProfile;
    protected var _dispatcher:Dispatcher = new Dispatcher();

    public function UserVideo() {
      super();

      _video = new VideoWithWarnings();
      _background.addChild(_video);
    }

    public function publish(camIndex:int, videoProfile:VideoProfile, streamName:String):void {
      if (_shuttingDown) {
        var logData:Object = UsersUtil.initLogData();
        logData.streamId = streamName;
        logData.tags = ["video"];
        logData.logCode = "publish_while_shutting_video_window";
        LOGGER.warn(JSON.stringify(logData));
        return;
      }

      _camIndex = camIndex;
      _videoProfile = videoProfile;
      _streamName = streamName;
      setOriginalDimensions(_videoProfile.width, _videoProfile.height);

      _video.updateCamera(camIndex, _videoProfile, _background.width, _background.height);
      
      invalidateDisplayList();
      startPublishing();
    }

    public static function newStreamName(userId:String, profile:VideoProfile):String {
      /**
       * Add timestamp to create a unique stream name. This way we can record   
       * stream without overwriting previously recorded streams.    
       */   
      var d:Date = new Date();
      var curTime:Number = d.getTime(); 
      var streamId: String = profile.id + "-" + userId + "-" + curTime;
       if (UsersUtil.isRecorded()) {
          // Append recorded to stream name to tell server to record this stream.
          // ralam (feb 27, 2017)
          streamId += "-recorded";
        }
        
        return streamId;
    }

    public static function getVideoProfile(stream:String):VideoProfile {
			var logData:Object = UsersUtil.initLogData();
			logData.tags = ["webcam"];
			logData.app = "video";
			logData.streamId = stream;
			
      var pattern:RegExp = new RegExp("([A-Za-z0-9]+)-([A-Za-z0-9_]+)-\\d+", "");
      if (pattern.test(stream)) {

				var vidProfile:VideoProfile = BBB.getVideoProfileById(pattern.exec(stream)[1]);
				
				logData.vidProfile = vidProfile.vidProfileInfo();
				logData.logCode = "get_video_profile";
				LOGGER.info(JSON.stringify(logData));
				
        return vidProfile;
      } else {

        var profile:VideoProfile = BBB.defaultVideoProfile;
        if (profile == null) {
          profile = BBB.fallbackVideoProfile;
        }
				
				logData.vidProfile = profile.vidProfileInfo();
				logData.logCode = "get_video_profile_failed";
				LOGGER.info(JSON.stringify(logData));
				
        return profile;
      }
    }

    private function startPublishing():void {
      _shuttingDown = false;

      var e:StartBroadcastEvent = new StartBroadcastEvent();
      e.stream = _streamName;
      e.camera = _video.getCamera();
      e.videoProfile = _videoProfile;
      _dispatcher.dispatchEvent(e);
    }

    public function shutdown():void {
      if (!_shuttingDown) {
        _shuttingDown = true;
        if (_ns) {
          stopViewing();
          _ns.close();
          _ns = null;
        }

        if (_video.cameraState()) {
            stopPublishing();
        }

        if (_video) {
            _video.disableCamera();
        }
      }
    }

    private function stopViewing():void {
        // Store that I stopped viewing this streamId;
        var myUserId: String = UsersUtil.getMyUserID();
        LiveMeeting.inst().webcams.stoppedViewingStream(myUserId, _streamName);
        
      var stopEvent:StoppedViewingWebcamEvent = new StoppedViewingWebcamEvent();
      stopEvent.webcamUserID = user.intId;
      stopEvent.streamName = _streamName;
      _dispatcher.dispatchEvent(stopEvent); 
      
    }

    private function startedViewing():void {
        // Store that I started viewing this streamId;
        var myUserId: String = UsersUtil.getMyUserID();
        LiveMeeting.inst().webcams.startedViewingStream(myUserId, _streamName);
        
        var startEvent:StartedViewingWebcamEvent = new StartedViewingWebcamEvent();
        startEvent.webcamUserID = user.intId;
        startEvent.streamName = _streamName;
        _dispatcher.dispatchEvent(startEvent); 
        
    }
    
    private function stopPublishing():void {
      var e:StopBroadcastEvent = new StopBroadcastEvent();
      e.stream = _streamName;
      e.camId = _camIndex;
      _dispatcher.dispatchEvent(e);
    }

    public function view(connection:NetConnection, streamName:String):void {
      if (_shuttingDown) {
        var logData:Object = UsersUtil.initLogData();
        logData.streamId = streamName;
        logData.tags = ["video"];
        logData.logCode = "view_while_shutting_video_window";
        LOGGER.warn(JSON.stringify(logData));
        return;
      }

      _streamName = streamName;
      _shuttingDown = false;

      _ns = new NetStream(connection);
      _ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
      _ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
      _ns.client = this;
      _ns.bufferTime = 0;
      _ns.receiveVideo(true);
      _ns.receiveAudio(false);
      
      _videoProfile = UserVideo.getVideoProfile(streamName);

      if (_videoProfile == null) {
        throw("Invalid video profile");
        return;
      }
      setOriginalDimensions(_videoProfile.width, _videoProfile.height);

      _video.attachNetStream(_ns, _videoProfile, _background.width, _background.height);
      
      if (options.applyConvolutionFilter) {
        var filter:ConvolutionFilter = new ConvolutionFilter();
        filter.matrixX = 3;
        filter.matrixY = 3;

        filter.matrix = options.convolutionFilter;
        filter.bias =  options.filterBias;
        filter.divisor = options.filterDivisor;
        _video.videoFilters([filter]);
      }
      
      _ns.play(streamName);

      startedViewing();
      
      invalidateDisplayList();
    }

    private function onNetStatus(e:NetStatusEvent):void{
			var logData:Object = UsersUtil.initLogData();
			logData.streamId = streamName;
			logData.tags = ["video"];
			
      switch(e.info.code){
        case "NetStream.Publish.Start":
					logData.logCode = "netstream_publish_start";
					LOGGER.warn(JSON.stringify(logData));
          break;
        case "NetStream.Play.UnpublishNotify":
					logData.logCode = "netstream_play_unpublish_notify";
					LOGGER.warn(JSON.stringify(logData));
          shutdown();
          break;
        case "NetStream.Play.Start":
					logData.logCode = "netstream_play_start";
					LOGGER.warn(JSON.stringify(logData));
          _dispatcher.dispatchEvent(new BBBEvent(BBBEvent.VIDEO_STARTED));
          break;
        case "NetStream.Play.FileStructureInvalid":
					logData.logCode = "netstream_play_invalid_file_structure";
					LOGGER.warn(JSON.stringify(logData));
          break;
        case "NetStream.Play.NoSupportedTrackFound":
					logData.logCode = "netstream_play_unsupported_track";
					LOGGER.warn(JSON.stringify(logData));
          break;
      }
    }

    private function onAsyncError(e:AsyncErrorEvent):void{
			var logData:Object = UsersUtil.initLogData();
			logData.streamId = streamName;
			logData.tags = ["video"];
			logData.logCode = "netstream_async_error";
			LOGGER.warn(JSON.stringify(logData));
    }
    
    private function onMetaData(info:Object):void {
		LOGGER.debug("width={0} height={1}", [info.width, info.height]);
    }

    override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
        super.updateDisplayList(unscaledWidth, unscaledHeight);

        updateDisplayListHelper(unscaledWidth, unscaledHeight, _video);
    }

     public function get camIndex():int {
      return _camIndex;
    }

     public function get streamName():String {
      return _streamName;
    }
  }
}
