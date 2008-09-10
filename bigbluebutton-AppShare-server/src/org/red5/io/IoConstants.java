package org.red5.io;

// TODO: Auto-generated Javadoc
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

/**
 * Constants found in FLV files / streams.
 */
public interface IoConstants {
    
    /** Video data. */
	public static final byte TYPE_VIDEO = 0x09;
    
    /** Audio data. */
	public static final byte TYPE_AUDIO = 0x08;
    
    /** Metadata. */
	public static final byte TYPE_METADATA = 0x12;
    
    /** Mask sound type. */
	public static final byte MASK_SOUND_TYPE = 0x01;
    
    /** Mono mode. */
	public static final byte FLAG_TYPE_MONO = 0x00;
    
    /** Stereo mode. */
	public static final byte FLAG_TYPE_STEREO = 0x01;
    
    /** Mask sound size. */
	public static final byte MASK_SOUND_SIZE = 0x02;
    
    /** 8 bit flag size. */
	public static final byte FLAG_SIZE_8_BIT = 0x00;
    
    /** 16 bit flag size. */
	public static final byte FLAG_SIZE_16_BIT = 0x01;
    
    /** Mask sound rate. */
	public static final byte MASK_SOUND_RATE = 0x0C;
    
    /** 5.5 KHz rate flag */
	public static final byte FLAG_RATE_5_5_KHZ = 0x00;
    
    /** 11 KHz rate flag. */
	public static final byte FLAG_RATE_11_KHZ = 0x01;
    
    /** 22 KHz rate flag. */
	public static final byte FLAG_RATE_22_KHZ = 0x02;
    
    /** 44 KHz rate flag. */
	public static final byte FLAG_RATE_44_KHZ = 0x03;
    
    /** Mask sound format (unsigned). */
	public static final byte MASK_SOUND_FORMAT = 0xF0 - 0xFF; // unsigned 
    
    /** Raw data format flag. */
	public static final byte FLAG_FORMAT_RAW = 0x00;
    
    /** ADPCM format flag. */
	public static final byte FLAG_FORMAT_ADPCM = 0x01;
    
    /** MP3 format flag. */
	public static final byte FLAG_FORMAT_MP3 = 0x02;
    
    /** 8 KHz NellyMoser audio format flag. */
	public static final byte FLAG_FORMAT_NELLYMOSER_8_KHZ = 0x05;

    /** NellyMoser-encoded audio format flag. */
    public static final byte FLAG_FORMAT_NELLYMOSER = 0x06;
    
    /** Mask video codec. */
	public static final byte MASK_VIDEO_CODEC = 0x0F;
    
    /** H263 codec flag. */
	public static final byte FLAG_CODEC_H263 = 0x02;
    
    /** Screen codec flag. */
	public static final byte FLAG_CODEC_SCREEN = 0x03;
    
    /** On2 VP6 codec flag. */
	public static final byte FLAG_CODEC_VP6 = 0x04;
    
    /** Video frametype flag. */
	public static final byte MASK_VIDEO_FRAMETYPE = 0xF0 - 0xFF; // unsigned 
    
    /** Keyframe type flag. */
	public static final byte FLAG_FRAMETYPE_KEYFRAME = 0x01;
    
    /** Interframe flag. Interframes are created from keyframes rather than independent image */
	public static final byte FLAG_FRAMETYPE_INTERFRAME = 0x02;
    
    /** Disposable frame type flag. */
	public static final byte FLAG_FRAMETYPE_DISPOSABLE = 0x03;

}
