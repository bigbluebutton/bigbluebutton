package org.red5.server.net.rtmp.event;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 2.1 of the License, or (at your option) any later 
 * version. 
 * 
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with this library; if not, write to the Free Software Foundation, Inc., 
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA 
 */

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * The Class FLVData.
 */
public class FLVData {

	/*
	 * 0x08 AUDIO Contains an audio packet similar to a SWF SoundStreamBlock
	 * plus codec information 
	 * 0x09 VIDEO Contains a video packet similar to a SWF VideoFrame plus
	 * codec information 
	 * 0x12 META Contains two AMF packets, the name of the event and the data
	 * to go with it
	 */

	/*
	 * soundType (byte & 0x01) == 0 0: mono, 1: stereo 
	 * soundSize (byte & 0x02) == 1 0: 8-bit, 2: 16-bit 
	 * soundRate (byte & 0x0C) == 2 0: 5.5kHz, 1: 11kHz, 2: 22kHz, 3: 44kHz 
	 * soundFormat (byte & 0xf0) == 4 0: Uncompressed, 1: ADPCM, 2: MP3, 
	 *     5: Nellymoser 8kHz mono, 6: Nellymoser
	 */

	/*
	 * codecID (byte & 0x0f) == 0 2: Sorensen H.263, 3: Screen video, 4: On2 VP6
	 * frameType (byte & 0xf0) == 4 1: keyframe, 2: inter frame, 3: disposable
	 * inter frame
	 */

	/** The data. */
	protected ByteBuffer data;

	/** The timestamp. */
	protected int timestamp = -1;

	/**
	 * Getter for disposable state.
	 * 
	 * @return  <code>true</code> if FVL data is disposable, <code>false</code> otherwise
	 */
    public boolean isDisposable() {
		return false;
	}

    /** Audio data. */
    public static final int TYPE_AUDIO = 8;
    
    /** Video data. */
	public static final int TYPE_VIDEO = 9;
    
    /** Metadata. */
	public static final int TYPE_METADATA = 12;
    
    /** Sorensen H263 codec marker. */
	public static final int VIDEO_SORENSEN_H263 = 2;
    
    /** Screen video. */
	public static final int VIDEO_SCREEN_VIDEO = 3;
    
    /** ON2 VP6 codec marker. */
	public static final int VIDEO_ON2_VP6 = 4;
    
    /** Keyframe. */
	public static final int FRAMETYPE_KEYFRAME = 1;
    
    /** Interframe. */
	public static final int FRAMETYPE_INTERFRAME = 2;
    
    /** Disposable. */
	public static final int FRAMETYPE_DISPOSABLE = 3;
    
    /** Uncompressed. */
	public static final int AUDIO_UNCOMPRESSED = 0;
    
    /** ADPCM data. */
	public static final int AUDIO_ADPCM = 1;
    
    /** MP3 data. */
	public static final int AUDIO_MP3 = 2;
    
    /** Nellymoser 8khz rate data. */
	public static final int AUDIO_NELLYMOOSER_8KHZ = 5;
    
    /** Nellymoser encoded data. */
	public static final int AUDIO_NELLYMOOSER = 6;
    
    /** Sound size when 8 khz quality marker. */
	public static final int SOUND_SIZE_8_BIT = 0;
    
    /** Sound size when 16 khz quality marker. */
	public static final int SOUND_SIZE_16_BIT = 2;
    
    /** Sound size when 5.5 khz rate marker */
	public static final int SOUND_RATE_5_5_KHZ = 1;
    
    /** Sound size when 11 khz rate marker. */
	public static final int SOUND_RATE_11_KHZ = 2;
    
    /** Sound size when 22 khz rate marker. */
	public static final int SOUND_RATE_22_KHZ = 3;
    
    /** Sound size when 44 khz rate marker. */
	public static final int SOUND_RATE_44_KHZ = 4;

	/*
	 * 0: Uncompressed, 1: ADPCM, 2: MP3, 5: Nellymoser 8kHz mono, 6: Nellymoser
	 */

	/**
	 * Getter for codec. Returns 0 by now.
	 * 
	 * @return  Codec
	 */
    public int getCodec() {
		return 0;
	}

}