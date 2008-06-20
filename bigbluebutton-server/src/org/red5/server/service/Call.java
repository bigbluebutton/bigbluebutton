package org.red5.server.service;

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

import java.io.Externalizable;
import java.io.IOException;
import java.io.ObjectInput;
import java.io.ObjectOutput;
import org.red5.server.api.service.IServiceCall;

// TODO: Auto-generated Javadoc
/**
 * Basic service call (remote call) implementation.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class Call
implements IServiceCall, Externalizable {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -3699712251588013875L;
    
    /** Pending status constant. */
	public static final byte STATUS_PENDING = 0x01;
    
    /** Success result constant. */
	public static final byte STATUS_SUCCESS_RESULT = 0x02;
    
    /** Returned value is null constant. */
	public static final byte STATUS_SUCCESS_NULL = 0x03;
    
    /** Service returns no value constant. */
	public static final byte STATUS_SUCCESS_VOID = 0x04;
    
    /** Service not found constant. */
	public static final byte STATUS_SERVICE_NOT_FOUND = 0x10;
    
    /** Service's method not found constant. */
	public static final byte STATUS_METHOD_NOT_FOUND = 0x11;
    
    /** Access denied constant. */
	public static final byte STATUS_ACCESS_DENIED = 0x12;

    /** Exception on invocation constant. */
    public static final byte STATUS_INVOCATION_EXCEPTION = 0x13;

    /** General exception constant. */
    public static final byte STATUS_GENERAL_EXCEPTION = 0x14;

    /** The application for this service is currently shutting down. */
    public static final byte STATUS_APP_SHUTTING_DOWN = 0x15;
    
    /** Service name. */
    protected String serviceName;
    
    /** Service method name. */
	protected String serviceMethodName;
    
    /** Call arguments. */
	protected Object[] arguments = null;
    
    /** Call status, initial one is pending. */
	protected byte status = STATUS_PENDING;
    
    /** Call exception if any, null by default. */
	protected Exception exception;
	
	/**
	 * Instantiates a new call.
	 */
	public Call() {}

    /**
     * Creates call from method name.
     * 
     * @param method        Method name
     */
	public Call(String method) {
		serviceMethodName = method;
	}

    /**
     * Creates call from method name and array of call parameters.
     * 
     * @param method        Method name
     * @param args          Call parameters
     */
    public Call(String method, Object[] args) {
		serviceMethodName = method;
		arguments = args;
	}

    /**
     * Creates call from given service name, method name and array of call parameters.
     * 
     * @param name         Service name
     * @param method       Service method name
     * @param args         Call parameters
     */
    public Call(String name, String method, Object[] args) {
		serviceName = name;
		serviceMethodName = method;
		arguments = args;
	}

	/**
     * {@inheritDoc}
	 */
	public boolean isSuccess() {
		return (status == STATUS_SUCCESS_RESULT)
				|| (status == STATUS_SUCCESS_NULL)
				|| (status == STATUS_SUCCESS_VOID);
	}

	/**
     * {@inheritDoc}
	 */
	public String getServiceMethodName() {
		return serviceMethodName;
	}

	/**
	 * Setter for service method name.
	 * 
	 * @param serviceMethodName  New service method name value
	 */
    public void setServiceMethodName(String serviceMethodName) {
		this.serviceMethodName = serviceMethodName;
	}

	/**
     * {@inheritDoc}
	 */
	public String getServiceName() {
		return serviceName;
	}

	/**
	 * Setter for service name.
	 * 
	 * @param serviceName  New service name value
	 */
    public void setServiceName(String serviceName) {
		this.serviceName = serviceName;
	}

	/**
     * {@inheritDoc}
	 */
	public Object[] getArguments() {
		return arguments;
	}

	/**
	 * Setter for arguments.
	 * 
	 * @param args  Arguments.
	 */
    public void setArguments(Object[] args) {
		arguments = args;
	}

	/**
     * {@inheritDoc}
	 */
	public byte getStatus() {
		return status;
	}

	/**
     * {@inheritDoc}
	 */
	public void setStatus(byte status) {
		this.status = status;
	}

	/**
     * {@inheritDoc}
	 */
	public Exception getException() {
		return exception;
	}

	/**
     * {@inheritDoc}
	 */
	public void setException(Exception exception) {
		this.exception = exception;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		StringBuilder sb = new StringBuilder("Service: ");
		sb.append(serviceName);
		sb.append(" Method: ");
		sb.append(serviceMethodName);
		if (arguments != null) {
			sb.append(" Num Params: ");
			sb.append(arguments.length);
			for (int i = 0; i < arguments.length; i++) {
				sb.append(i);
				sb.append(": ");
				sb.append(arguments[i]);
			}
		} else {
			sb.append(" No params");
		}
		return sb.toString();
	}

	/* (non-Javadoc)
	 * @see java.io.Externalizable#readExternal(java.io.ObjectInput)
	 */
	public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
		serviceName = (String) in.readObject();
		serviceMethodName = (String) in.readObject();
		arguments = (Object[]) in.readObject();
		status = in.readByte();
		exception = (Exception) in.readObject();
	}

	/* (non-Javadoc)
	 * @see java.io.Externalizable#writeExternal(java.io.ObjectOutput)
	 */
	public void writeExternal(ObjectOutput out) throws IOException {
		out.writeObject(serviceName);
		out.writeObject(serviceMethodName);
		out.writeObject(arguments);
		out.writeByte(status);
		out.writeObject(exception);
	}
}
