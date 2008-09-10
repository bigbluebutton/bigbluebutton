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
 * The Class ProtocolException.
 */
public class ProtocolException extends RuntimeException {

	/** Base exception for all protocol exeptions. */
	private static final long serialVersionUID = -5380844081848027068L;

    /**
     * Create protocol exception with given message.
     * 
     * @param message the message
     */
    public ProtocolException(String message) {
		super(message);
	}

    /**
     * Create protocol exception with given message and cause.
     * 
     * @param message the message
     * @param cause the cause
     */
    public ProtocolException(String message, Throwable cause) {
    	super(message, cause);
    }

}
