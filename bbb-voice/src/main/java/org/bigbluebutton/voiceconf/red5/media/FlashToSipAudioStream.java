/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.voiceconf.red5.media;

import java.net.DatagramSocket;
import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.voiceconf.red5.media.transcoder.FlashToSipTranscoder;
import org.bigbluebutton.voiceconf.red5.media.transcoder.TranscodedAudioDataListener;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.SerializeUtils;
import org.slf4j.Logger;

/*****************************************************************************
;  FlashToSipAudioStream
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to flash to sip audio stream
;
; HISTORY
; __date__ :        PTS:            Description
; 03-30-2011
******************************************************************************/
public class FlashToSipAudioStream {
	private final static Logger log = Red5LoggerFactory.getLogger(FlashToSipAudioStream.class, "sip");



	private final FlashToSipTranscoder transcoder;	
	private IStreamListener mInputListener;
	private final DatagramSocket srcSocket;
	private final SipConnectInfo connInfo;
	private String talkStreamName;	
	private RtpStreamSender rtpSender;
	private TranscodedAudioListener transcodedAudioListener;
	private volatile boolean processAudioData = false;

    /*****************************************************************************
    ;  FlashToSipAudioStream
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this is the class constructor.
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   transcoder  :   FlashToSipTranscoder
    ;   srcSocket   :   DatagramSocket
    ;   connInfo    :   SipConnectInfo
    ;   
    ; IMPLEMENTATION
    ;  assign transcoder, socket, connection info
    ;  set listener
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public FlashToSipAudioStream(final FlashToSipTranscoder transcoder, DatagramSocket srcSocket, SipConnectInfo connInfo) {
    
        if ( (null == transcoder)   ||
             (null == srcSocket)    ||
             (null == connInfo)     ){
             
            log.error("error input parameter");
        }
		this.transcoder = transcoder;
		this.srcSocket = srcSocket;
		this.connInfo = connInfo;		
		talkStreamName = "microphone_" + System.currentTimeMillis();
		transcodedAudioListener = new TranscodedAudioListener();
        if ( null == transcodedAudioListener ){
            log.error("error initialize transcodedAudioListener");
        }
		transcoder.setTranscodedAudioListener(transcodedAudioListener);
	    transcoder.setProcessAudioData(processAudioData);
    }/**END FUNCTION FlashToSipAudioStream**/
    
    /*****************************************************************************
    ;  start
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to start to receive the audio stream.
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   broadcastStream  :   IBroadcastStream
    ;   scope            :   IScope
    ;   
    ; IMPLEMENTATION
    ;  set process data
    ;  get data from buffer
    ;  add stream listener
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public void start(IBroadcastStream broadcastStream, IScope scope) throws StreamException {
    
        if ( (null == broadcastStream)  ||
             (null == scope)    ){
             
            log.error("error input parameter");
            return ;
        }
	    log.debug("startTranscodingStream({},{})", broadcastStream.getPublishedName(), scope.getName());
	    processAudioData = true;
	    transcoder.setProcessAudioData(processAudioData);
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
		    	  if (data.length > 20)                //==Don't send silence data whose data length is 11
		    		  transcoder.handlePacket(data, 1, data.length-1);   
		      } 
			}
		};

	    broadcastStream.addStreamListener(mInputListener);    
	    rtpSender = new RtpStreamSender(srcSocket, connInfo);
        if ( null == rtpSender ){
            log.error("error initialize rtpSender");
            return ;
        }
		rtpSender.connect();


	}/**END FUNCTION start**/
    
    /*****************************************************************************
    ;  stop
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to stop receiving the audio stream.
    ;
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   broadcastStream  :   IBroadcastStream
    ;   scope            :   IScope
    ;   
    ; IMPLEMENTATION
    ;  remove listener
    ;  stop process data
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public void stop(IBroadcastStream broadcastStream, IScope scope) {
    
        if ( (null == broadcastStream)  ||
             (null == scope)    ){
             
            log.error("error input parameter");
            return ;
        }
		broadcastStream.removeStreamListener(mInputListener);
		if (broadcastStream != null) {
			broadcastStream.stop();
			broadcastStream.close();
		} 
	    processAudioData = false;
	    transcoder.setProcessAudioData(processAudioData);
	    srcSocket.close();		
	}/**END FUNCTION stop**/

    /*****************************************************************************
    ;  getStreamName
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get the stream name.
    ;
    ; RETURNS : String
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  get stream name
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public String getStreamName() {
		return talkStreamName;
	}/**END FUNCTION getStreamName**/

    /*****************************************************************************
    ;  TranscodedAudioListener
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this class is the transcode audion listener class
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public class TranscodedAudioListener implements TranscodedAudioDataListener {
    
        /*****************************************************************************
        ;  handleTranscodedAudioData
        ;----------------------------------------------------------------------------
        ; DESCRIPTION
        ;   this routine is used to handle the audio data.
        ;
        ; RETURNS : N/A
        ;
        ; INTERFACE NOTES
        ;   INPUT
        ;   audioData   :   byte[]
        ;   timestamp   :   long
        '
        ; IMPLEMENTATION
        ;  send audio data
        ; HISTORY
        ; __date__ :        PTS:            Description
        ; 03-30-2011
        ******************************************************************************/
		@Override
		public void handleTranscodedAudioData(byte[] audioData, long timestamp) {
			if (audioData != null && processAudioData) {
	  		  rtpSender.sendAudio(audioData, transcoder.getCodecId(), timestamp);
	  	  } else {
	  		  log.warn("Transcodec audio is null. Discarding.");
	  	  }
		}/**END FUNCTION handleTranscodedAudioData**/		
	}/**END CLASS TranscodedAudioListener**/
}/**END CLASS FlashToSipAudioStream**/