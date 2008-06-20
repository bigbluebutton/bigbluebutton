package org.red5.server.exception;

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
 * The client is not allowed to connect. Reason that provided with this
 * exception is sent to client-side status event description.
 */
public class ClientRejectedException extends RuntimeException {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 9204597649465357898L;
	
	/** The reason. */
	@SuppressWarnings("all") private Object reason;

	/**
	 * Constructs a new ClientRejectedException.
	 */
    public ClientRejectedException() {
		this(null);
	}

    /**
     * Create new exception with given rejection reason.
     * 
     * @param reason          Rejection reason
     */
    public ClientRejectedException(Object reason) {
		super();
		this.reason = reason;
	}

	/**
	 * Getter for reason.
	 * 
	 * @return  Rejection reason
	 */
    public Object getReason() {
		return reason;
	}

}
