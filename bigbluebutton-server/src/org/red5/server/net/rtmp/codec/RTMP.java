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

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.IConnection.Encoding;
import org.red5.server.net.protocol.ProtocolState;
import org.red5.server.net.rtmp.message.Header;
import org.red5.server.net.rtmp.message.Packet;

// TODO: Auto-generated Javadoc
/**
 * RTMP is the RTMP protocol state representation.
 */
public class RTMP extends ProtocolState {
    
    /** Connect state. */
	public static final byte STATE_CONNECT = 0x00;
    
    /** Handshake state. Server sends handshake request to client right after connection estabilished. */
	public static final byte STATE_HANDSHAKE = 0x01;
    
    /** Connected. */
	public static final byte STATE_CONNECTED = 0x02;
    
    /** Error. */
	public static final byte STATE_ERROR = 0x03;
    
    /** Disconnected. */
	public static final byte STATE_DISCONNECTED = 0x04;
	
	/** Sent the connect message to origin. */
	public static final byte STATE_EDGE_CONNECT_ORIGIN_SENT = 0x11;
	
	/** Forwarded client's connect call to origin. */
	public static final byte STATE_ORIGIN_CONNECT_FORWARDED = 0x12;
	
	/** Edge is disconnecting, waiting Origin close connection. */
	public static final byte STATE_EDGE_DISCONNECTING = 0x13;
    
    /** Client mode. */
	public static final boolean MODE_CLIENT = true;
    
    /** Server mode. */
	public static final boolean MODE_SERVER = false;
    
    /** Default chunk size. Packets are read and written chunk-by-chunk. */
	public static final int DEFAULT_CHUNK_SIZE = 128;
    
    /** RTMP state. */
	private byte state = STATE_CONNECT;
    
    /** Server mode by default. */
	private boolean mode = MODE_SERVER;
    
    /** Debug flag. */
	private boolean debug;
    
    /** Last read channel. */
	private int lastReadChannel = 0x00;
    
    /** Last write channel. */
	private int lastWriteChannel = 0x00;
    
    /** Read headers. */
	private Map<Integer, Header> readHeaders = new HashMap<Integer, Header>();
    
    /** Write headers. */
	private Map<Integer, Header> writeHeaders = new HashMap<Integer, Header>();
    
    /** Read packets. */
	private Map<Integer, Packet> readPackets = new HashMap<Integer, Packet>();
    
    /** Written packets. */
	private Map<Integer, Packet> writePackets = new HashMap<Integer, Packet>();
    
    /** Read chunk size. Packets are read and written chunk-by-chunk. */
	private int readChunkSize = DEFAULT_CHUNK_SIZE;
    
    /** Write chunk size. Packets are read and written chunk-by-chunk. */
	private int writeChunkSize = DEFAULT_CHUNK_SIZE;
	
	/** Encoding type for objects. */
	private Encoding encoding = Encoding.AMF0;
	
	/** Handshake as sent to the client. */
	private byte[] handshake;
	
    /**
     * Creates RTMP object with initial mode.
     * 
     * @param mode            Initial mode
     */
	public RTMP(boolean mode) {
		this.mode = mode;
	}

	/**
	 * Return current mode.
	 * 
	 * @return  Current mode
	 */
    public boolean getMode() {
		return mode;
	}

	/**
	 * Getter for debug.
	 * 
	 * @return  Debug state
	 */
    public boolean isDebug() {
		return debug;
	}

	/**
	 * Setter for debug.
	 * 
	 * @param debug  Debug flag new value
	 */
    public void setDebug(boolean debug) {
		this.debug = debug;
	}

	/**
	 * Return current state.
	 * 
	 * @return  State
	 */
    public byte getState() {
		return state;
	}

    /**
     * Releases number of packets.
     * 
     * @param packets            Packets to release
     */
    private void freePackets(Map<Integer, Packet> packets) {
		for (Packet packet : packets.values()) {
			if (packet != null && packet.getData() != null) {
				packet.getData().release();
				packet.setData(null);
			}
		}
		packets.clear();
	}

	/**
	 * Setter for state.
	 * 
	 * @param state  New state
	 */
    public void setState(byte state) {
		this.state = state;
		if (state == STATE_DISCONNECTED) {
			// Free temporary packets
			freePackets(readPackets);
			freePackets(writePackets);
			readHeaders.clear();
			writeHeaders.clear();
		}
	}

    /**
     * Setter for last read header.
     * 
     * @param channelId            Channel id
     * @param header               Header
     */
    public void setLastReadHeader(int channelId, Header header) {
		lastReadChannel = channelId;
		readHeaders.put(channelId, header);
	}

    /**
     * Return last read header for channel.
     * 
     * @param channelId             Channel id
     * 
     * @return                      Last read header
     */
	public Header getLastReadHeader(int channelId) {
		return readHeaders.get(channelId);
	}

    /**
     * Setter for last written header.
     * 
     * @param channelId             Channel id
     * @param header                Header
     */
	public void setLastWriteHeader(int channelId, Header header) {
		lastWriteChannel = channelId;
		writeHeaders.put(channelId, header);
	}

    /**
     * Return last written header for channel.
     * 
     * @param channelId             Channel id
     * 
     * @return                      Last written header
     */
	public Header getLastWriteHeader(int channelId) {
		return writeHeaders.get(channelId);
	}

    /**
     * Setter for last read packet.
     * 
     * @param channelId           Channel id
     * @param packet              Packet
     */
	public void setLastReadPacket(int channelId, Packet packet) {
		Packet prevPacket = readPackets.put(channelId, packet);
		if (prevPacket != null && prevPacket.getData() != null) {
			prevPacket.getData().release();
			prevPacket.setData(null);
		}
	}

    /**
     * Return last read packet for channel.
     * 
     * @param channelId           Channel id
     * 
     * @return                    Last read packet for that channel
     */
	public Packet getLastReadPacket(int channelId) {
		return readPackets.get(channelId);
	}

    /**
     * Setter for last written packet.
     * 
     * @param channelId           Channel id
     * @param packet              Last written packet
     */
	public void setLastWritePacket(int channelId, Packet packet) {
		// Disabled to help GC because we currently don't use the write packets
		/*
		Packet prevPacket = writePackets.put(channelId, packet);
		if (prevPacket != null && prevPacket.getData() != null) {
			prevPacket.getData().release();
			prevPacket.setData(null);
		}
		*/
	}

    /**
     * Return packet that has been written last.
     * 
     * @param channelId           Channel id
     * 
     * @return                    Packet that has been written last
     */
	public Packet getLastWritePacket(int channelId) {
		return writePackets.get(channelId);
	}

	/**
	 * Return channel being read last.
	 * 
	 * @return  Last read channel
	 */
    public int getLastReadChannel() {
		return lastReadChannel;
	}

	/**
	 * Getter for channel being written last.
	 * 
	 * @return  Last write channel
	 */
    public int getLastWriteChannel() {
		return lastWriteChannel;
	}

	/**
	 * Getter for  write chunk size. Data is being read chunk-by-chunk.
	 * 
	 * @return  Read chunk size
	 */
    public int getReadChunkSize() {
		return readChunkSize;
	}

	/**
	 * Setter for  read chunk size. Data is being read chunk-by-chunk.
	 * 
	 * @param readChunkSize Value to set for property 'readChunkSize'.
	 */
    public void setReadChunkSize(int readChunkSize) {
		this.readChunkSize = readChunkSize;
	}

	/**
	 * Getter for  write chunk size. Data is being written chunk-by-chunk.
	 * 
	 * @return  Write chunk size
	 */
    public int getWriteChunkSize() {
		return writeChunkSize;
	}

	/**
	 * Setter for  write chunk size.
	 * 
	 * @param writeChunkSize  Write chunk size
	 */
    public void setWriteChunkSize(int writeChunkSize) {
		this.writeChunkSize = writeChunkSize;
	}

    /**
     * Getter for encoding version.
     * 
     * @return Encoding version
     */
    public Encoding getEncoding() {
    	return encoding;
    }
    
    /**
     * Setter for encoding version.
     * 
     * @param encoding Encoding version
     */
    public void setEncoding(Encoding encoding) {
    	this.encoding = encoding;
    }
    
    /**
     * Store the handshake sent to the client.
     * 
     * @param data    Handshake data
     * @param length  Length of handshake to store
     * @param start the start
     */
    public void setHandshake(ByteBuffer data, int start, int length) {
    	handshake = new byte[length];
    	int old = data.position();
    	data.position(start);
    	data.get(handshake);
    	data.position(old);
    }
    
    /**
     * Check if the handshake reply received from a client contains valid data.
     * 
     * @param data the data
     * @param length the length
     * @param start the start
     * 
     * @return true, if validate handshake reply
     */
    public boolean validateHandshakeReply(ByteBuffer data, int start, int length) {
    	if (handshake == null || length != handshake.length) {
    		return false;
    	}
    	
    	byte[] reply = new byte [length];
    	int old = data.position();
    	data.position(start);
    	data.get(reply);
    	data.position(old);
    	
    	return Arrays.equals(reply, handshake);
    }
    
}