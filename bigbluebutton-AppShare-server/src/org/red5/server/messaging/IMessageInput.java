package org.red5.server.messaging;

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

import java.io.IOException;
import java.util.List;
import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * Input Endpoint for a consumer to connect.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IMessageInput {
	
	/**
	 * Pull message from this input endpoint. Return
	 * w/o waiting.
	 * 
	 * @return The pulled message or <tt>null</tt> if message is
	 * not available.
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	IMessage pullMessage() throws IOException;

	/**
	 * Pull message from this input endpoint. Wait
	 * <tt>wait</tt> milliseconds if message is not available.
	 * 
	 * @param wait milliseconds to wait when message is not
	 * available.
	 * 
	 * @return The pulled message or <tt>null</tt> if message is
	 * not available.
	 */
	IMessage pullMessage(long wait);

	/**
	 * Connect to a consumer.
	 * 
	 * @param consumer         Consumer
	 * @param paramMap         Parameters map
	 * 
	 * @return <tt>true</tt> when successfully subscribed,
	 * <tt>false</tt> otherwise.
	 */
	boolean subscribe(IConsumer consumer, Map paramMap);

	/**
	 * Disconnect from a consumer.
	 * 
	 * @param consumer    Consumer to disconnect
	 * 
	 * @return <tt>true</tt> when successfully unsubscribed,
	 * <tt>false</tt> otherwise.
	 */
	boolean unsubscribe(IConsumer consumer);

	/**
	 * Getter for consumers list.
	 * 
	 * @return Consumers.
	 */
    List<IConsumer> getConsumers();

	/**
	 * Send OOB Control Message to all providers on the other side of pipe.
	 * 
	 * @param consumer The consumer that sends the message
	 * @param oobCtrlMsg Out-of-band control message
	 */
	void sendOOBControlMessage(IConsumer consumer, OOBControlMessage oobCtrlMsg);
}
