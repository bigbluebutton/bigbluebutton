package org.red5.server.net.rtmp.message;

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
 * Class for AMF and RTMP marker values constants.
 */
public interface Constants {

    /** Medium integer max value. */
    public static final int MEDIUM_INT_MAX = 16777215;

    /** RTMP chunk size constant. */
    public static final byte TYPE_CHUNK_SIZE = 0x01;

	// Unknown: 0x02

    /** Send every x bytes read by both sides. */
    public static final byte TYPE_BYTES_READ = 0x03;

    /** Ping is a stream control message, has subtypes. */
    public static final byte TYPE_PING = 0x04;

    /** Server (downstream) bandwidth marker. */
    public static final byte TYPE_SERVER_BANDWIDTH = 0x05;

    /** Client (upstream) bandwidth marker. */
    public static final byte TYPE_CLIENT_BANDWIDTH = 0x06;

	// Unknown: 0x07

    /** Audio data marker. */
    public static final byte TYPE_AUDIO_DATA = 0x08;

    /** Video data marker. */
    public static final byte TYPE_VIDEO_DATA = 0x09;

	// Unknown: 0x0A ...  0x0E

    /** AMF3 stream send. */
    public static final byte TYPE_FLEX_STREAM_SEND = 0x0F;
    
    /** AMF3 shared object. */
    public static final byte TYPE_FLEX_SHARED_OBJECT = 0x10;
    
    /** AMF3 message. */
    public static final byte TYPE_FLEX_MESSAGE = 0x11;

    /** Notification is invocation without response. */
    public static final byte TYPE_NOTIFY = 0x12;

    /** Stream metadata. */
    public static final byte TYPE_STREAM_METADATA = 0x12;

    /** Shared Object marker. */
    public static final byte TYPE_SHARED_OBJECT = 0x13;

    /** Invoke operation (remoting call but also used for streaming) marker. */
    public static final byte TYPE_INVOKE = 0x14;

    /** New header marker. */
    public static final byte HEADER_NEW = 0x00;

    /** Same source marker. */
    public static final byte HEADER_SAME_SOURCE = 0x01;

    /** Timer change marker. */
    public static final byte HEADER_TIMER_CHANGE = 0x02;

    /** There's more to encode. */
    public static final byte HEADER_CONTINUE = 0x03;

    /** Size of initial handshake between client and server. */
    public static final int HANDSHAKE_SIZE = 1536;

    /** Client Shared Object data update. */
    public static final byte SO_CLIENT_UPDATE_DATA = 0x04; //update data

    /** Client Shared Object attribute update. */
    public static final byte SO_CLIENT_UPDATE_ATTRIBUTE = 0x05; //5: update attribute

    /** Send SO message flag. */
    public static final byte SO_CLIENT_SEND_MESSAGE = 0x06; // 6: send message

    /** Shared Object status marker. */
    public static final byte SO_CLIENT_STATUS = 0x07; // 7: status (usually returned with error messages)

    /** Clear event for Shared Object. */
    public static final byte SO_CLIENT_CLEAR_DATA = 0x08; // 8: clear data

    /** Delete data for Shared Object. */
    public static final byte SO_CLIENT_DELETE_DATA = 0x09; // 9: delete data

    /** Initial SO data flag. */
    public static final byte SO_CLIENT_INITIAL_DATA = 0x0B; // 11: initial data

    /** Shared Object connection. */
    public static final byte SO_CONNECT = 0x01;

    /** Shared Object disconnection. */
    public static final byte SO_DISCONNECT = 0x02;

    /** Set Shared Object attribute flag. */
    public static final byte SO_SET_ATTRIBUTE = 0x03;

    /** Send message flag. */
    public static final byte SO_SEND_MESSAGE = 0x06;

    /** Shared Object attribute deletion flag. */
    public static final byte SO_DELETE_ATTRIBUTE = 0x0A;

	/** The Constant ACTION_CONNECT. */
	public static final String ACTION_CONNECT = "connect";

	/** The Constant ACTION_DISCONNECT. */
	public static final String ACTION_DISCONNECT = "disconnect";

	/** The Constant ACTION_CREATE_STREAM. */
	public static final String ACTION_CREATE_STREAM = "createStream";

	/** The Constant ACTION_DELETE_STREAM. */
	public static final String ACTION_DELETE_STREAM = "deleteStream";

	/** The Constant ACTION_CLOSE_STREAM. */
	public static final String ACTION_CLOSE_STREAM = "closeStream";

	/** The Constant ACTION_RELEASE_STREAM. */
	public static final String ACTION_RELEASE_STREAM = "releaseStream";

	/** The Constant ACTION_PUBLISH. */
	public static final String ACTION_PUBLISH = "publish";

	/** The Constant ACTION_PAUSE. */
	public static final String ACTION_PAUSE = "pause";

	/** The Constant ACTION_SEEK. */
	public static final String ACTION_SEEK = "seek";

	/** The Constant ACTION_PLAY. */
	public static final String ACTION_PLAY = "play";

	/** The Constant ACTION_STOP. */
	public static final String ACTION_STOP = "disconnect";

	/** The Constant ACTION_RECEIVE_VIDEO. */
	public static final String ACTION_RECEIVE_VIDEO = "receiveVideo";

	/** The Constant ACTION_RECEIVE_AUDIO. */
	public static final String ACTION_RECEIVE_AUDIO = "receiveAudio";

}
