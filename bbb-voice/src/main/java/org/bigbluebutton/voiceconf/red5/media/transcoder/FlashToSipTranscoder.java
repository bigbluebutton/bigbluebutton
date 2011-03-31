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

import org.bigbluebutton.voiceconf.red5.media.FlashToSipAudioStream.TranscodedAudioListener;

/*****************************************************************************
;  FlashToSipTranscoder
;----------------------------------------------------------------------------
; DESCRIPTION
;   this class is the interface class
;
; HISTORY
; __date__ :        PTS:            Description
; 03-30-2011
******************************************************************************/
public interface FlashToSipTranscoder {

    /*****************************************************************************
    ;  transcode
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   audioData   :   byte[]
    ;   startOffset :   int
    ;   length      :   int
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	void transcode(byte[] audioData, int startOffset, int length);
    
    /*****************************************************************************
    ;  handlePacket
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   data        :   byte[]
    ;   begin       :   int
    ;   end         :   int
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	void handlePacket(byte[] data, int begin, int end);
    
    /*****************************************************************************
    ;  getOutgoingEncodedFrameSize
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
	int getOutgoingEncodedFrameSize();
    
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
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    int getCodecId();
    
    /*****************************************************************************
    ;  setTranscodedAudioListener
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   transcodedAudioListener :   TranscodedAudioListener
    ;
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    void setTranscodedAudioListener(TranscodedAudioListener transcodedAudioListener);
    
    /*****************************************************************************
    ;  setProcessAudioData
    ;----------------------------------------------------------------------------
    ; DESCRIPTION
    ;   
    ; RETURNS : N/A
    ;
    ; INTERFACE NOTES
    ;   INPUT
    ;   isProcessing :   boolean
    ;
    ; IMPLEMENTATION
    ;  
    ; HISTORY
    ; __date__ :        PTS:            Description
    ; 03-30-2011
    ******************************************************************************/
    void setProcessAudioData(boolean isProcessing);
    
}/**END CLASS FlashToSipTranscoder**/