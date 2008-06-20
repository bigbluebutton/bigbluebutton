package org.red5.server.net.rtmp.status;

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
 * Runtime status object.
 */
public class RuntimeStatusObject extends StatusObject {

	/** Serializable. */
	private static final long serialVersionUID = 6990998992583246039L;
    
    /** Status event details. */
	protected String details = "";
    
    /** Client id. */
	protected int clientid = 0;

	/**
	 * Constructs a new RuntimeStatusObject.
	 */
    public RuntimeStatusObject() {
		super();
	}

    /**
     * Create runtime status object with given code, level and description.
     * 
     * @param code                  Status code
     * @param level                 Level
     * @param description           Status event description
     */
	public RuntimeStatusObject(String code, String level, String description) {
		super(code, level, description);
	}

    /**
     * Create runtime status object with given code, level, description, details and client id.
     * 
     * @param code                  Status code
     * @param level                 Level
     * @param description           Status event description
     * @param details               Status event details
     * @param clientid              Client id
     */
	public RuntimeStatusObject(String code, String level, String description,
			String details, int clientid) {
		super(code, level, description);
		this.details = details;
		this.clientid = clientid;
	}

	/**
	 * Getter for client id.
	 * 
	 * @return  Client id
	 */
    public int getClientid() {
		return clientid;
	}

	/**
	 * Setter for client id.
	 * 
	 * @param clientid  Client id
	 */
    public void setClientid(int clientid) {
		this.clientid = clientid;
	}

	/**
	 * Getter for details.
	 * 
	 * @return  Status event details
	 */
    public String getDetails() {
		return details;
	}

	/**
	 * Setter for details.
	 * 
	 * @param details Status event details
	 */
    public void setDetails(String details) {
		this.details = details;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.status.StatusObject#readExternal(java.io.ObjectInput)
	 */
	@Override
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		super.readExternal(in);
		clientid = in.readInt();
		details = (String) in.readObject();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.net.rtmp.status.StatusObject#writeExternal(java.io.ObjectOutput)
	 */
	@Override
	public void writeExternal(ObjectOutput out) throws IOException {
		super.writeExternal(out);
		out.writeInt(clientid);
		out.writeObject(details);
	}
}
