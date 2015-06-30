package org.bigbluebutton.modules.videoconf.views
{
  import com.asfusion.mate.events.Dispatcher;

  import flash.events.AsyncErrorEvent;
  import flash.events.Event;
  import flash.events.NetStatusEvent;
  import flash.filters.ConvolutionFilter;
  import flash.text.TextField;
  import flash.media.Camera;
  import flash.media.Video;
  import flash.net.NetConnection;
  import flash.net.NetStream;
  import mx.utils.ObjectUtil;

  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.model.VideoProfile;
  import org.bigbluebutton.main.events.BBBEvent;
  import org.bigbluebutton.main.events.StoppedViewingWebcamEvent;
  import org.bigbluebutton.main.views.VideoWithWarnings;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
  import org.bigbluebutton.modules.videoconf.events.StartBroadcastEvent;
  import org.bigbluebutton.modules.videoconf.events.StopBroadcastEvent;

  public class UserVideo extends UserGraphic {
    private static const LOG:String = "Videoconf::UserVideo - ";

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

    public function publish(camIndex:int, videoProfile:VideoProfile):void {
      _camIndex = camIndex;
      _videoProfile = videoProfile;
      setOriginalDimensions(_videoProfile.width, _videoProfile.height);

      _video.updateCamera(camIndex, _videoProfile, _background.width, _background.height);
      
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
      var pattern:RegExp = new RegExp("([A-Za-z0-9_]+)-([A-Za-z0-9]+)-\\d+", "");
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

      _video.attachNetStream(_ns, _videoProfile, _background.width, _background.height);
      
      if (options.applyConvolutionFilter) {
        var filter:ConvolutionFilter = new ConvolutionFilter();
        filter.matrixX = 3;
        filter.matrixY = 3;
        trace("Applying convolution filter =[" + options.convolutionFilter + "]");
        filter.matrix = options.convolutionFilter;
        filter.bias =  options.filterBias;
        filter.divisor = options.filterDivisor;
        _video.videoFilters([filter]);
      }
      
      _ns.play(streamName);

      user.addViewingStream(streamName);
      invalidateDisplayList();
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
      trace(LOG + e.text);
    }
    
    private function onMetaData(info:Object):void {
      trace(LOG + " width=" + info.width + " height=" + info.height);
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
