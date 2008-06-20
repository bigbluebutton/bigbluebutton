package org.red5.server.stream;

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

import org.red5.server.stream.message.RTMPMessage;

// TODO: Auto-generated Javadoc
/**
 * Interface for classes that implement logic to drop frames.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IFrameDropper {

	/** Send keyframes, interframes and disposable interframes. */
    public static final int SEND_ALL = 0;

	/** Send keyframes and interframes. */
    public static final int SEND_INTERFRAMES = 1;

	/** Send keyframes only. */
    public static final int SEND_KEYFRAMES = 2;

	/** Send keyframes only and switch to SEND_INTERFRAMES later. */
    public static final int SEND_KEYFRAMES_CHECK = 3;

	/**
	 * Checks if a message may be sent to the subscriber.
	 * 
	 * @param message the message to check
	 * @param pending the number of pending messages
	 * 
	 * @return <code>true</code> if the packet may be sent, otherwise
	 * <code>false</code>
	 */
	boolean canSendPacket(RTMPMessage message, long pending);

	/**
	 * Notify that a packet has been dropped.
	 * 
	 * @param message the message that was dropped
	 */
	void dropPacket(RTMPMessage message);

	/**
	 * Notify that a message has been sent.
	 * 
	 * @param message the message that was sent
	 */
	void sendPacket(RTMPMessage message);

	/**
	 * Reset the frame dropper.
	 */
	void reset();

	/**
	 * Reset the frame dropper to a given state.
	 * 
	 * @param state the state to reset the frame dropper to
	 */
	void reset(int state);

}
