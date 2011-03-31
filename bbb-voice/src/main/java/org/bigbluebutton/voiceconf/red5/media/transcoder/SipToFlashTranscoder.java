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

import org.bigbluebutton.voiceconf.red5.media.SipToFlashAudioStream;

/*****************************************************************************
;  SipToFlashTranscoder
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is used to trancode the speex codec from flash to sip server
;  
; HISTORY
; __date__ :        PTS:            Description
; 03-30-2011
******************************************************************************/
public interface SipToFlashTranscoder {
    
    /*****************************************************************************
    ;  transcode
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioCodec   :   byte[]
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	void transcode(byte[] audioData);
    
    /*****************************************************************************
    ;  getCodecId
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : int
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    int getCodecId();
    
    /*****************************************************************************
    ;  getIncomingEncodedFrameSize
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : int
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    int getIncomingEncodedFrameSize();
    
    /*****************************************************************************
    ;  handleData
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioCodec   :   byte[]
    ;   offset       :   int
    ;   len          :   int
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    void handleData(byte[] audioData, int offset, int len);
    
    /*****************************************************************************
    ;  setTranscodedAudioListener
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   sipToFlashAudioStream   :   SipToFlashAudioStream
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    void setTranscodedAudioListener(SipToFlashAudioStream sipToFlashAudioStream);
    
    /*****************************************************************************
    ;  setProcessAudioData
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   isProcessing   :   boolean
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    void setProcessAudioData(boolean isProcessing);

}/**END CLASS SipToFlashTranscoder**/