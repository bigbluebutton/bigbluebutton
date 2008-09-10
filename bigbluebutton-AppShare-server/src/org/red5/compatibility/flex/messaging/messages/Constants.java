package org.red5.compatibility.flex.messaging.messages;

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
 * Constants for the flex compatibility messages.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class Constants {

	/** Operation id of register command. */
	public static final int OPERATION_REGISTER = 0;
	
	/** Operation id of poll command. */
	public static final int OPERATION_POLL = 2;
	
	/** Operation id of ping commands. */
	public static final int OPERATION_PING = 5;

	/** Operation id of authentication commands. */
	public static final int OPERATION_AUTHENTICATION = 8;

	/** Header field that holds the name of the endpoint. */
	public static final String HEADER_ENDPOINT = "DSEndpoint";
	
	/** Set all attributes from a data message. */
	public static final int DATA_OPERATION_SET = 10;
	
	/** Update given attributes from a data message. */
	public static final int DATA_OPERATION_UPDATE_ATTRIBUTES = 3;

	/** Update destination based on nested DataMessage packet. */
	public static final int DATA_OPERATION_UPDATE = 7;

}
