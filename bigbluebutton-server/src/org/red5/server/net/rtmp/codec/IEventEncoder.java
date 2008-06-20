package org.red5.server.net.rtmp.codec;

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
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.BytesRead;
import org.red5.server.net.rtmp.event.ChunkSize;
import org.red5.server.net.rtmp.event.Invoke;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.event.Ping;
import org.red5.server.net.rtmp.event.Unknown;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.so.ISharedObjectMessage;

// TODO: Auto-generated Javadoc
/**
 * Encodes events to byte buffer.
 */
public interface IEventEncoder {
    
    /**
     * Encodes Notify event to byte buffer.
     * 
     * @param notify         Notify event
     * @param rtmp 		 RTMP protocol state
     * 
     * @return               Byte buffer
     */
	public abstract ByteBuffer encodeNotify(Notify notify, RTMP rtmp);

    /**
     * Encodes Invoke event to byte buffer.
     * 
     * @param invoke         Invoke event
     * @param rtmp 		 RTMP protocol state
     * 
     * @return               Byte buffer
     */
	public abstract ByteBuffer encodeInvoke(Invoke invoke, RTMP rtmp);

    /**
     * Encodes Ping event to byte buffer.
     * 
     * @param ping           Ping event
     * 
     * @return               Byte buffer
     */
    public abstract ByteBuffer encodePing(Ping ping);

    /**
     * Encodes BytesRead event to byte buffer.
     * 
     * @param streamBytesRead    BytesRead event
     * 
     * @return                   Byte buffer
     */
    public abstract ByteBuffer encodeBytesRead(BytesRead streamBytesRead);

    /**
     * Encodes AudioData event to byte buffer.
     * 
     * @param audioData          AudioData event
     * 
     * @return                   Byte buffer
     */
    public abstract ByteBuffer encodeAudioData(AudioData audioData);

    /**
     * Encodes VideoData event to byte buffer.
     * 
     * @param videoData          VideoData event
     * 
     * @return                   Byte buffer
     */
    public abstract ByteBuffer encodeVideoData(VideoData videoData);

    /**
     * Encodes Unknown event to byte buffer.
     * 
     * @param unknown            Unknown event
     * 
     * @return                   Byte buffer
     */
    public abstract ByteBuffer encodeUnknown(Unknown unknown);

    /**
     * Encodes ChunkSize event to byte buffer.
     * 
     * @param chunkSize          ChunkSize event
     * 
     * @return                   Byte buffer
     */
    public abstract ByteBuffer encodeChunkSize(ChunkSize chunkSize);

    /**
     * Encodes SharedObjectMessage event to byte buffer.
     * 
     * @param so                 ISharedObjectMessage event
     * @param rtmp 			 RTMP protocol state
     * 
     * @return                   Byte buffer
     */
    public abstract ByteBuffer encodeSharedObject(ISharedObjectMessage so, RTMP rtmp);

    /**
     * Encodes SharedObjectMessage event to byte buffer using AMF3 encoding.
     * 
     * @param so                 ISharedObjectMessage event
     * @param rtmp 			 RTMP protocol state
     * 
     * @return                   Byte buffer
     */
    public ByteBuffer encodeFlexSharedObject(ISharedObjectMessage so, RTMP rtmp);
}