package org.bigbluebutton.app.video;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IBandwidthConfigure;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamCapableConnection;
import org.red5.server.api.stream.support.SimpleConnectionBWConfig;
import org.slf4j.Logger;

public class VideoApplication extends MultiThreadedApplicationAdapter { 
	private static Logger log = Red5LoggerFactory.getLogger(VideoApplication.class, "video");
	
	private VideoTranscoder videoTranscoder = new VideoTranscoder();
	
	private IScope appScope;
	
    @Override
	public boolean appStart(IScope app) {
	    super.appStart(app);
		log.info("video appStart");  
		appScope = app;
		return true;
	}

    @Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.info("oflaDemo appConnect");
		// Trigger calling of "onBWDone", required for some FLV players
		measureBandwidth(conn);
		if (conn instanceof IStreamCapableConnection) {
			IStreamCapableConnection streamConn = (IStreamCapableConnection) conn;
			SimpleConnectionBWConfig bwConfig = new SimpleConnectionBWConfig();
			bwConfig.getChannelBandwidth()[IBandwidthConfigure.OVERALL_CHANNEL] =
				1024 * 1024;
			bwConfig.getChannelInitialBurst()[IBandwidthConfigure.OVERALL_CHANNEL] =
				128 * 1024;
			streamConn.setBandwidthConfigure(bwConfig);
		}
			 
		return super.appConnect(conn, params);
	}

    @Override
	public void appDisconnect(IConnection conn) {
		log.info("oflaDemo appDisconnect");
		super.appDisconnect(conn);//
	}
    
    /**
     * Called on publish: NetStream.publish("streamname", "live")
     */
    @Override
    public void streamPublishStart(IBroadcastStream stream) {
      log.debug("streamPublishStart: {}; {}", stream, stream.getPublishedName());
      System.out.println("streamPublishStart: "+ stream.getPublishedName());
      super.streamPublishStart(stream);
      videoTranscoder.startTranscodingStream(stream,
          Red5.getConnectionLocal().getScope());
    }
    
    @Override
    public void streamBroadcastClose(IBroadcastStream stream) {
      log.debug("streamBroadcastClose: {}; {}", stream, stream.getPublishedName());
      
      videoTranscoder.stopTranscodingStream(stream,
          Red5.getConnectionLocal().getScope());
      super.streamBroadcastClose(stream);
    }

    
}
