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
package org.bigbluebutton.voiceconf.red5.media.transcoder;

import java.util.Random;

import org.bigbluebutton.voiceconf.red5.media.SipToFlashAudioStream;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

/*****************************************************************************
;  SpeexSipToFlashTranscoderImp
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to trancode the speex codec from sip server to flash
;  
; HISTORY
; __date__ :        PTS:            Description
; 03-30-2011
******************************************************************************/
public class SpeexSipToFlashTranscoderImp implements SipToFlashTranscoder {
	protected static Logger log = Red5LoggerFactory.getLogger(SpeexSipToFlashTranscoderImp.class, "sip");

	private static final int SPEEX_CODEC = 178; /* 1011 1111 (see flv spec) */
	private Codec audioCodec = null;
	private long timestamp = 0;
	private static final int TS_INCREMENT = 20; // Determined from PCAP traces.
	private TranscodedAudioDataListener transcodedAudioListener;

    /*****************************************************************************
    ;  SpeexSipToFlashTranscoderImp
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of the class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   codec   :   type of codec
    ;   
    ; IMPLEMENTATION
    ;  generate random
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public SpeexSipToFlashTranscoderImp(Codec codec) {
        
        if ( null == codec ){
            log.error("error input parameter");
        }
        
		this.audioCodec = codec;
        Random rgen = new Random();
        if ( null == rgen ){
            log.error("failed to initialize rgen");
        }
        timestamp = rgen.nextInt(1000);
	}/** END FUNCTION SpeexSipToFlashTranscoderImp **/

    /*****************************************************************************
    ;  transcode
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to transcode the audion data
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioData   :   audion data
    ;   
    ; IMPLEMENTATION
    ;  handle audio data
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void transcode(byte[] audioData ) {
		byte[] codedBuffer = audioData;
//		System.out.println("Speex transcode:"+audioData.length);
		transcodedAudioListener.handleTranscodedAudioData(codedBuffer, timestamp += TS_INCREMENT);
	}/** END FUNCTION transcode **/

    /*****************************************************************************
    ;  getCodecId
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get the codec id
    ; RETURNS : int
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   N/A
    ;   
    ; IMPLEMENTATION
    ;  return the speex codec id
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public int getCodecId() {
		return SPEEX_CODEC;
	}/** END FUNCTION getCodecId **/

    /*****************************************************************************
    ;  getIncomingEncodedFrameSize
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get the encoded frame size
    ; RETURNS : int
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   N/A
    ;   
    ; IMPLEMENTATION
    ;  return incoming encoded frame size
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public int getIncomingEncodedFrameSize() {
		return audioCodec.getIncomingEncodedFrameSize();
	}/** END FUNCTION getIncomingEncodedFrameSize **/

    /*****************************************************************************
    ;  handleData
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to handle data to be transcoded
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioData   :   audio data
    ;   offset      :   off set
    ;   len         :   length of data
    ;   
    ; IMPLEMENTATION
    ;  copy audio data to array
    ;  transcode data
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void handleData(byte[] audioData, int offset, int len) {
		byte[] data = new byte[len];
		System.arraycopy(audioData, offset, data, 0, len);
		transcode(data);

	}/** END FUNCTION handleData **/

    /*****************************************************************************
    ;  setTranscodedAudioListener
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to set the transcode listener
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   sipToFlashAudioStream   :   audio stream   
    ;   
    ; IMPLEMENTATION
    ;  assign transcode audio listener
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void setTranscodedAudioListener(
			SipToFlashAudioStream sipToFlashAudioStream) {
        
        if ( null == sipToFlashAudioStream ){
            log.error("error input parameter");
            return ;
        }
		this.transcodedAudioListener = sipToFlashAudioStream;

	} /** END FUNCTION setTranscodedAudioListener **/

    /*****************************************************************************
    ;  setProcessAudioData
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   isProcessing    :   boolean
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void setProcessAudioData(boolean isProcessing) {

	}/**END FUNCTION setProcessAudioData**/


}/**END CLASS SpeexSipToFlashTranscoderImp**/