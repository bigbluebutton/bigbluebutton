package org.red5.server.net.protocol;

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

import java.util.List;

import org.apache.mina.common.ByteBuffer;
import org.apache.mina.filter.codec.ProtocolCodecException;

// TODO: Auto-generated Javadoc
/**
 * Simple protocol decoder.
 */
public interface SimpleProtocolDecoder {

	/**
	 * Decode.
	 * 
	 * @param state Stores state for the protocol, ProtocolState is just a marker
	 * interface
	 * @param in ByteBuffer of data to be decoded
	 * 
	 * @return one of three possible values. null : the object could not be
	 * decoded, or some data was skipped, just continue. ProtocolState :
	 * the decoder was unable to decode the whole object, refer to the
	 * protocol state Object : something was decoded, continue
	 * 
	 * @throws ProtocolCodecException 	 * @throws Exception the exception
	 */
	public Object decode(ProtocolState state, ByteBuffer in) throws Exception;

	/**
	 * Decode all available objects in buffer.
	 * 
	 * @param state Stores state for the protocol
	 * @param buffer ByteBuffer of data to be decoded
	 * 
	 * @return a list of decoded objects, may be empty if nothing could be
	 * decoded
	 */
	public List decodeBuffer(ProtocolState state, ByteBuffer buffer);

}
