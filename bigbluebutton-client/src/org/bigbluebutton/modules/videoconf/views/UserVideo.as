package org.bigbluebutton.modules.videoconf.views
{
  import com.asfusion.mate.events.Dispatcher;

  import flash.events.AsyncErrorEvent;
  import flash.events.Event;
  import flash.events.NetStatusEvent;
  import flash.filters.ConvolutionFilter;
  import flash.media.Camera;
  import flash.media.Video;
  import flash.net.NetConnection;
  import flash.net.NetStream;
  import mx.utils.ObjectUtil;

  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.model.VideoProfile;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.StoppedViewingWebcamEvent;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
  import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;

  public class UserVideo extends UserGraphic {

    protected var _camera:Camera;
    protected var _camIndex:int = -1;

    protected var _ns:NetStream;

    protected var _shuttingDown:Boolean = false;
    protected var _streamName:String;
    protected var _video:Video = null;
    protected var _videoProfile:VideoProfile;
    protected var _dispatcher:Dispatcher = new Dispatcher();

    public function UserVideo() {

    }

    public function publish(camIndex:int, videoProfile:VideoProfile):void {
      _videoProfile = videoProfile;
      _camIndex = camIndex;

      _camera = Camera.getCamera(camIndex.toString());
      _camera.setMotionLevel(5, 1000);
      _camera.setKeyFrameInterval(videoProfile.keyFrameInterval);
      _camera.setMode(videoProfile.width, videoProfile.height, videoProfile.modeFps);
      _camera.setQuality(videoProfile.qualityBandwidth, videoProfile.qualityPicture);

      setOriginalDimensions(_camera.width, _camera.height);

      _video = new Video();
      _video.attachCamera(_camera);
      _video.smoothing = true;
      addChild(_video);
      invalidateDisplayList();

      startPublishing();
    }

    private function newStreamName():String {
      /**
       * Add timestamp to create a unique stream name. This way we can record   
       * stream without overwriting previously recorded streams.    
       */   
      var d:Date = new Date();
      var curTime:Number = d.getTime(); 
      var uid:String = user.userID;
      return _videoProfile.id + "-" + uid + "-" + curTime;
    }

    protected function getVideoProfile(stream:String):VideoProfile {
      trace("Parsing stream name [" + stream + "]");
      var pattern:RegExp = new RegExp("([A-Za-z0-9]+)-([A-Za-z0-9]+)-\\d+", "");
      if (pattern.test(stream)) {
        trace("The stream name is well formatted");
        trace("Video profile resolution is [" + pattern.exec(stream)[1] + "]");
        trace("Userid [" + pattern.exec(stream)[2] + "]");
        return BBB.getVideoProfileById(pattern.exec(stream)[1]);
      } else {
        trace("Bad stream name format");
        var profile:VideoProfile = BBB.defaultVideoProfile;
        if (profile == null) {
          profile = BBB.fallbackVideoProfile;
        }
        return profile;
      }
    }

    private function startPublishing():void {
      _streamName = newStreamName();
      _shuttingDown = false;

      var e:StartBroadcastEvent = new StartBroadcastEvent();
      e.stream = _streamName;
      e.camera = _camera;
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

        if (_camera) {
          stopPublishing();
          _camera = null;
          if (_video) {
            _video.attachCamera(null);
          }
        }

        if (_video) {
            removeChild(_video);
            _video.clear();
            _video = null;
        }
      }
    }

    private function stopViewing():void {
      var stopEvent:StoppedViewingWebcamEvent = new StoppedViewingWebcamEvent();
      stopEvent.webcamUserID = user.userID;
      stopEvent.streamName = _streamName;
      _dispatcher.dispatchEvent(stopEvent); 
      user.removeViewingStream(_streamName);
    }

    private function stopPublishing():void {
      var e:StopBroadcastEvent = new StopBroadcastEvent();
      e.stream = _streamName;
      e.camId = _camIndex;
      _dispatcher.dispatchEvent(e);
    }

    public function view(connection:NetConnection, streamName:String):void {
      _streamName = streamName;
      _shuttingDown = false;

      _ns = new NetStream(connection);
      _ns.addEventListener(NetStatusEvent.NET_STATUS, onNetStatus);
      _ns.addEventListener(AsyncErrorEvent.ASYNC_ERROR, onAsyncError);
      _ns.client = this;
      _ns.bufferTime = 0;
      _ns.receiveVideo(true);
      _ns.receiveAudio(false);
      
      _videoProfile = getVideoProfile(streamName);
      trace("Remote video profile: " + _videoProfile.toString());
      if (_videoProfile == null) {
        throw("Invalid video profile");
        return;
      }
      setOriginalDimensions(_videoProfile.width, _videoProfile.height);

      _video = new Video(_videoProfile.width, _videoProfile.height);
      _video.smoothing = true;
      _video.attachNetStream(_ns);
      
      if (options.applyConvolutionFilter) {
        var filter:ConvolutionFilter = new ConvolutionFilter();
        filter.matrixX = 3;
        filter.matrixY = 3;
        trace("Applying convolution filter =[" + options.convolutionFilter + "]");
        filter.matrix = options.convolutionFilter;
        filter.bias =  options.filterBias;
        filter.divisor = options.filterDivisor;
        _video.filters = [filter];
      }
      
      _ns.play(streamName);
      addChild(_video);

      user.addViewingStream(streamName);
    }

    private function onNetStatus(e:NetStatusEvent):void{
      switch(e.info.code){
        case "NetStream.Publish.Start":
          trace("NetStream.Publish.Start for broadcast stream " + _streamName);
          break;
        case "NetStream.Play.UnpublishNotify":
          shutdown();
          break;
        case "NetStream.Play.Start":
          trace("Netstatus: " + e.info.code);
          _dispatcher.dispatchEvent(new BBBEvent(BBBEvent.VIDEO_STARTED));
          break;
        case "NetStream.Play.FileStructureInvalid":
          trace("The MP4's file structure is invalid.");
          break;
        case "NetStream.Play.NoSupportedTrackFound":
          trace("The MP4 doesn't contain any supported tracks");
          break;
      }
    }

    private function onAsyncError(e:AsyncErrorEvent):void{
      trace(ObjectUtil.toString(e));
    }

    override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
        super.updateDisplayList(unscaledWidth, unscaledHeight);

        if (_video) {
          resetGraphicDimensions(_video, unscaledWidth, unscaledHeight);
        }
    }

     public function get camIndex():int {
      return _camIndex;
    }

     public function get streamName():String {
      return _streamName;
    }
  }
}