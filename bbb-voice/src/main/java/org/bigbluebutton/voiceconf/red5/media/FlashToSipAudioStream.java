package org.bigbluebutton.voiceconf.red5.media;


import java.net.DatagramSocket;
import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.voiceconf.red5.media.transcoder.Transcoder;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.SerializeUtils;
import org.slf4j.Logger;

public class FlashToSipAudioStream {
	private final static Logger log = Red5LoggerFactory.getLogger(FlashToSipAudioStream.class, "sip");

	private final Transcoder transcoder;	
	private IStreamListener mInputListener;
	private final DatagramSocket srcSocket;
	private final SipConnectInfo connInfo;
	private String talkStreamName;
	
	private RtpStreamSender rtpSender;
	
	public FlashToSipAudioStream(final Transcoder transcoder, DatagramSocket srcSocket, SipConnectInfo connInfo) {
		this.transcoder = transcoder;
		this.srcSocket = srcSocket;
		this.connInfo = connInfo;				    
	}
	
	public void start(IBroadcastStream broadcastStream, IScope scope) throws StreamException {
	    log.debug("startTranscodingStream({},{})", broadcastStream.getPublishedName(), scope.getName());
	    talkStreamName = broadcastStream.getPublishedName();
		
		mInputListener = new IStreamListener() {
			public void packetReceived(IBroadcastStream broadcastStream, IStreamPacket packet) {
		      IoBuffer buf = packet.getData();
		      if (buf != null)
		    	  buf.rewind();
		    
		      if (buf == null || buf.remaining() == 0){
		    	  log.debug("skipping empty packet with no data");
		    	  return;
		      }
		          
		      if (packet instanceof AudioData) {
		    	  byte[] data = SerializeUtils.ByteBufferToByteArray(buf);
		    	  rtpSender.send(data, 1, data.length-1);	    			  
		      } 
			}
		};
	    broadcastStream.addStreamListener(mInputListener);    
	    rtpSender = new RtpStreamSender(transcoder, srcSocket, connInfo);
		rtpSender.connect();
	}

	public void stop(IBroadcastStream broadcastStream, IScope scope) {
		broadcastStream.removeStreamListener(mInputListener);
	}
	
	public void sendDtmfDigits(String dtmfDigits) throws StreamException {
		rtpSender.sendDtmfDigits(dtmfDigits);
	}
	
	public String getStreamName() {
		return talkStreamName;
	}
}
