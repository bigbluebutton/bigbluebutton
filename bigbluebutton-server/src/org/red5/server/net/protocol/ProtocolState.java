package org.red5.server.net.protocol;

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
 * Represents current state of protocol.
 */
public class ProtocolState {
    
    /** Session key constant. */
	public static final String SESSION_KEY = "protocol_state";

    /** Decoding finished successfully state constant. */
    public static byte DECODER_OK = 0x00;

    /** Deconding continues state constant. */
    public static byte DECODER_CONTINUE = 0x01;

    /** Decoder is buffering state constant. */
    public static byte DECODER_BUFFER = 0x02;

    /** Classes like the RTMP state object will extend this marker interface. */
	private int decoderBufferAmount;

    /** Current decoder state, decoder is stopped by default. */
    private byte decoderState = DECODER_OK;
	
	/**
	 * Returns current buffer amount.
	 * 
	 * @return Buffer amount
	 */
	public int getDecoderBufferAmount() {
		return decoderBufferAmount;
	}
	
	/**
	 * Specifies buffer decoding amount.
	 * 
	 * @param amount        Buffer decoding amount
	 */
	public void bufferDecoding(int amount) {
		decoderState = DECODER_BUFFER;
		decoderBufferAmount = amount;
	}
	
	/**
	 * Set decoding state as "needed to be continued".
	 */
	public void continueDecoding() {
		decoderState = DECODER_CONTINUE;
	}
	
	/**
	 * Checks whether remaining buffer size is greater or equal than buffer amount and so if it makes sense to start decoding.
	 * 
	 * @param remaining 	Remaining buffer size
	 * 
	 * @return 			<code>true</code> if there is data to decode, <code>false</code> otherwise
	 */
	public boolean canStartDecoding(int remaining) {
		if (remaining >= decoderBufferAmount) {
			return true;
		} else {
			return false;
		}
	}
	
	/**
	 * Starts decoding. Sets state to "ready" and clears buffer amount.
	 */
	public void startDecoding() {
		decoderState = DECODER_OK;
		decoderBufferAmount = 0;
	}
	
	/**
	 * Checks whether decoding is complete.
	 * 
	 * @return <code>true</code> if decoding has finished, <code>false</code> otherwise
	 */
	public boolean hasDecodedObject() {
		return (decoderState == DECODER_OK);
	}
	
	/**
	 * Checks whether decoding process can be continued.
	 * 
	 * @return <code>true</code> if decoding can be continued, <code>false</code> otherwise
	 */
	public boolean canContinueDecoding() {
		return (decoderState != DECODER_BUFFER);
	}

}
