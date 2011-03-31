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

import org.bigbluebutton.voiceconf.red5.media.FlashToSipAudioStream.TranscodedAudioListener;
import org.red5.app.sip.codecs.Codec;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

/*****************************************************************************
;  SpeexFlashToSipTranscoderImp
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to trancode the speex codec from flash to sip server
;  
; HISTORY
; __date__ :        PTS:            Description
; 03-30-2011
******************************************************************************/
public class SpeexFlashToSipTranscoderImp implements FlashToSipTranscoder {
	protected static Logger log = Red5LoggerFactory.getLogger(SpeexFlashToSipTranscoderImp.class, "sip");

	private Codec audioCodec;
	private long timestamp = 0;
	private final static int TS_INCREMENT = 320; // Determined from PCAP traces.
	private TranscodedAudioListener transcodedAudioListener;

    /*****************************************************************************
    ;  SpeexFlashToSipTranscoderImp
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is the constructor of the class
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioCodec   :   type of codec
    ;   
    ; IMPLEMENTATION
    ;  assign audio codec
    ;  generate random number
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public SpeexFlashToSipTranscoderImp(Codec audioCodec) {
        if ( null == audioCodec ){
            log.error("error input parameter");
        }
		
        this.audioCodec = audioCodec;
        Random rgen = new Random();
        if ( null == rgen ){
            log.error("error failed to initialize rgen");
        }
        
        timestamp = rgen.nextInt(1000);
	    System.out.println("Speex start!");
	} /** END FUNCTION SpeexFlashToSipTranscoderImp **/

    /*****************************************************************************
    ;  transcode
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to transcode the audio data
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioData   :   audio data
    ;   startOffset :   off set
    ;   length      :   length of data
    ;   
    ; IMPLEMENTATION
    ;  copy array of audio data
    ;  handle transcode audio data
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public void transcode(byte[] audioData, int startOffset, int length) {
		byte[] transcodedAudio = new byte[length];
		System.arraycopy(audioData, startOffset, transcodedAudio, 0, length);
		transcodedAudioListener.handleTranscodedAudioData(transcodedAudio, timestamp += TS_INCREMENT);
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
    ;  return codec id
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public int getCodecId() {
		return audioCodec.getCodecId();
	}/** END FUNCTION getCodecId **/

    /*****************************************************************************
    ;  getOutgoingEncodedFrameSize
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
    ;  get the outgoin frame size
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public int getOutgoingEncodedFrameSize() {
		return audioCodec.getOutgoingEncodedFrameSize();
	}/** END FUNCTION getOutgoingEncodedFrameSize **/

    /*****************************************************************************
    ;  getOutgoingPacketization
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to get the outgoin packet
    ; RETURNS : int
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   N/A
    ;
    ; IMPLEMENTATION
    ;  get the outgoin packet
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	public int getOutgoingPacketization() {
		return audioCodec.getOutgoingPacketization();
	}/** END FUNCTION getOutgoingPacketization **/

    /*****************************************************************************
    ;  handlePacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to handle the packet of data
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   data    :   data
    ;   begin   :   begin packet
    ;   end     :   end packet
    ;
    ; IMPLEMENTATION
    ;  transcode the data
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void handlePacket(byte[] data, int begin, int end) {
		transcode(data, begin, end);

	}/** END FUNCTION handlePacket **/

    /*****************************************************************************
    ;  setTranscodedAudioListener
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   this routine is used to handle the packet of data
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   transcodedAudioListener :   TranscodedAudioListener
    ;
    ; IMPLEMENTATION
    ;  add listener
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void setTranscodedAudioListener(
			TranscodedAudioListener transcodedAudioListener) {
            
        if ( null == transcodedAudioListener ){
            log.error("error input parameter");
            return ;
        }
		this.transcodedAudioListener = transcodedAudioListener;

	}/** END FUNCTION TranscodedAudioListener **/

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
    ;
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	@Override
	public void setProcessAudioData(boolean isProcessing) {
		// TODO  do nothing here;

	}/** END FUNCTION setProcessAudioData **/
}/**END CLASS SpeexFlashToSipTranscoderImp**/
