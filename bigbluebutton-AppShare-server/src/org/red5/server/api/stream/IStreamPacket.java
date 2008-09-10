package org.red5.server.api.stream;

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
 * Packet containing stream data.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IStreamPacket {

	/**
	 * Type of this packet. This is one of the <code>TYPE_</code> constants.
	 * 
	 * @return the type
	 */
	public byte getDataType();
	
	/**
	 * Timestamp of this packet.
	 * 
	 * @return the timestamp in milliseconds
	 */
	public int getTimestamp();
	
	/**
	 * Packet contents.
	 * 
	 * @return the contents
	 */
	public ByteBuffer getData();
	
}
