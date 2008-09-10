package org.red5.server.net.rtmp.event;

import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
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
 * Ping event, actually combination of different events.
 */
public class Ping extends BaseEvent {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -6478248060425544923L;
    
    /** Stream clear event. */
	public static final short STREAM_CLEAR = 0;
    
    /** Stream play. */
	public static final short STREAM_PLAYBUFFER_CLEAR = 1;
    
    /** Unknown event. */
	public static final short UNKNOWN_2 = 2;
    
    /** Client buffer. */
	public static final short CLIENT_BUFFER = 3;
    
    /** Stream reset. */
	public static final short STREAM_RESET = 4;
    
    /** One more unknown event. */
	public static final short UNKNOWN_5 = 5;
    
    /** Client ping event. */
	public static final short PING_CLIENT = 6;
    
    /** Server response event. */
	public static final short PONG_SERVER = 7;

    /** One more unknown event. */
    public static final short UNKNOWN_8 = 8;

    /** Event type is undefined. */
    public static final int UNDEFINED = -1;

	/** The value1. */
	private short value1; // XXX: can someone suggest better names?

	/** The value2. */
	private int value2;

	/** The value3. */
	private int value3 = UNDEFINED;

	/** The value4. */
	private int value4 = UNDEFINED;

    /** Debug string. */
    private String debug = "";

	/**
	 * Constructs a new Ping.
	 */
    public Ping() {
		super(Type.SYSTEM);
	}

    /**
     * Instantiates a new ping.
     * 
     * @param value1 the value1
     * @param value2 the value2
     */
    public Ping(short value1, int value2) {
		super(Type.SYSTEM);
		this.value1 = value1;
		this.value2 = value2;
	}

	/**
	 * Instantiates a new ping.
	 * 
	 * @param value1 the value1
	 * @param value2 the value2
	 * @param value3 the value3
	 */
	public Ping(short value1, int value2, int value3) {
		super(Type.SYSTEM);
		this.value1 = value1;
		this.value2 = value2;
		this.value3 = value3;
	}

	/**
	 * Instantiates a new ping.
	 * 
	 * @param value1 the value1
	 * @param value2 the value2
	 * @param value3 the value3
	 * @param value4 the value4
	 */
	public Ping(short value1, int value2, int value3, int value4) {
		super(Type.SYSTEM);
		this.value1 = value1;
		this.value2 = value2;
		this.value3 = value3;
		this.value4 = value4;
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_PING;
	}

	/**
	 * Getter for property 'value1'.
	 * 
	 * @return Value for property 'value1'.
	 */
    public short getValue1() {
		return value1;
	}

	/**
	 * Setter for property 'value1'.
	 * 
	 * @param value1 Value to set for property 'value1'.
	 */
    public void setValue1(short value1) {
		this.value1 = value1;
	}

	/**
	 * Getter for property 'value2'.
	 * 
	 * @return Value for property 'value2'.
	 */
    public int getValue2() {
		return value2;
	}

	/**
	 * Setter for property 'value2'.
	 * 
	 * @param value2 Value to set for property 'value2'.
	 */
    public void setValue2(int value2) {
		this.value2 = value2;
	}

	/**
	 * Getter for property 'value3'.
	 * 
	 * @return Value for property 'value3'.
	 */
    public int getValue3() {
		return value3;
	}

	/**
	 * Setter for property 'value3'.
	 * 
	 * @param value3 Value to set for property 'value3'.
	 */
    public void setValue3(int value3) {
		this.value3 = value3;
	}

	/**
	 * Getter for property 'value4'.
	 * 
	 * @return Value for property 'value4'.
	 */
    public int getValue4() {
		return value4;
	}

	/**
	 * Setter for property 'value4'.
	 * 
	 * @param value4 Value to set for property 'value4'.
	 */
    public void setValue4(int value4) {
		this.value4 = value4;
	}

	/**
	 * Getter for property 'debug'.
	 * 
	 * @return Value for property 'debug'.
	 */
    public String getDebug() {
		return debug;
	}

	/**
	 * Setter for property 'debug'.
	 * 
	 * @param debug Value to set for property 'debug'.
	 */
    public void setDebug(String debug) {
		this.debug = debug;
	}

	/**
	 * Do release.
	 */
	protected void doRelease() {
		value1 = 0;
		value2 = 0;
		value3 = UNDEFINED;
		value4 = UNDEFINED;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "Ping: " + value1 + ", " + value2 + ", " + value3 + ", "
				+ value4 + "\n" + debug;
	}

	/** {@inheritDoc} */
    @Override
	protected void releaseInternal() {

	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#readExternal(java.io.ObjectInput)
	 */
	@Override
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		super.readExternal(in);
		value1 = in.readShort();
		value2 = in.readInt();
		value3 = in.readInt();
		value4 = in.readInt();
		// XXX do we need to restore "debug" ?
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.event.BaseEvent#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeShort(value1);
		out.writeInt(value2);
		out.writeInt(value3);
		out.writeInt(value4);
		// XXX do we need to save "debug" ?
	}
}