package org.red5.server.net.rtmp.status;

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import org.red5.annotations.Anonymous;
import org.red5.io.object.ICustomSerializable;
import org.red5.io.object.Output;
import org.red5.io.object.Serializer;

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
 * Represents status object that are transferred between server and client.
 */
@Anonymous
public class Status
implements StatusCodes, ICustomSerializable, Externalizable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -5501563718489586136L;
    
    /** Error constant. */
	public static final String ERROR = "error";
    
    /** Status constant. */
	public static final String STATUS = "status";
    
    /** Warning constant. */
	public static final String WARNING = "warning";
    
    /** Status code. */
	protected String code;
    
    /** Status level. */
	protected String level;
    
    /** Status event description. */
	protected String description = "";
    
    /** Status event details. */
	protected String details = "";
    
    /** Id of client. */
	protected int clientid;

	/**
	 * Constructs a new Status.
	 */
    public Status() {

	}

    /**
     * Creates status object with given status code.
     * 
     * @param code            Status code
     */
	public Status(String code) {
		this.code = code;
		this.level = STATUS;
	}

    /**
     * Creates status object with given level, description and status code.
     * 
     * @param code            Status code
     * @param level           Level
     * @param description     Description
     */
    public Status(String code, String level, String description) {
		this.code = code;
		this.level = level;
		this.description = description;
	}

	/**
	 * Getter for status code.
	 * 
	 * @return  Status code
	 */
    public String getCode() {
		return code;
	}

	/**
	 * Setter for code.
	 * 
	 * @param code Status code
	 */
    public void setCode(String code) {
		this.code = code;
	}

	/**
	 * Getter for description.
	 * 
	 * @return Status event description.
	 */
    public String getDescription() {
		return description;
	}

	/**
	 * Setter for desciption.
	 * 
	 * @param description Status event description.
	 */
    public void setDesciption(String description) {
		this.description = description;
	}

	/**
	 * Getter for level.
	 * 
	 * @return Level
	 */
    public String getLevel() {
		return level;
	}

	/**
	 * Setter for level.
	 * 
	 * @param level Level
	 */
    public void setLevel(String level) {
		this.level = level;
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
	 * @param details  Status event details
	 */
    public void setDetails(String details) {
		this.details = details;
	}

	/**
	 * Setter for description.
	 * 
	 * @param description  Status event description
	 */
    public void setDescription(String description) {
		this.description = description;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		return "Status: code: " + getCode() + " desc: " + getDescription()
				+ " level: " + getLevel();
	}

    /* (non-Javadoc)
     * @see org.red5.io.object.ICustomSerializable#serialize(org.red5.io.object.Output, org.red5.io.object.Serializer)
     */
    public void serialize(Output output, Serializer serializer) {
    	output.putString("level");
    	output.writeString(getLevel());
    	output.putString("code");
    	output.writeString(getCode());
    	output.putString("description");
    	output.writeString(getDescription());
    	output.putString("details");
    	if (getDetails() != null) {
    		output.writeString(getDetails());
    	} else {
    		output.writeNull();
    	}
    	output.putString("clientid");
    	output.writeNumber(getClientid());
    }

	/* (non-Javadoc)
	 * @see java.io.Externalizable#readExternal(java.io.ObjectInput)
	 */
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		clientid = in.readInt();
		code = (String) in.readObject();
		description = (String) in.readObject();
		details = (String) in.readObject();
		level = (String) in.readObject();
	}

	/* (non-Javadoc)
	 * @see java.io.Externalizable#writeExternal(java.io.ObjectOutput)
	 */
	public void writeExternal(ObjectOutput out) throws IOException {
		out.writeInt(clientid);
		out.writeObject(code);
		out.writeObject(description);
		out.writeObject(details);
		out.writeObject(level);
	}
}
