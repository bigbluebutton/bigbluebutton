package org.red5.server.messaging;

import java.io.IOException;

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
 * A provider that supports passive pulling of messages.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IPullableProvider extends IProvider {
	
	/** The Constant KEY. */
	public static final String KEY = IPullableProvider.class.getName();

	/**
	 * Pull message.
	 * 
	 * @param pipe the pipe
	 * 
	 * @return the i message
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	IMessage pullMessage(IPipe pipe) throws IOException;

	/**
	 * Pull message.
	 * 
	 * @param pipe the pipe
	 * @param wait the wait
	 * 
	 * @return the i message
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	IMessage pullMessage(IPipe pipe, long wait) throws IOException;
}
