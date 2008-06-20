package org.red5.server.net.rtmp.event;

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
import org.red5.server.api.service.IPendingServiceCall;

// TODO: Auto-generated Javadoc
/**
 * Remote invocation event.
 */
public class Invoke extends Notify {
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = -769677790148010729L;

	/**
	 * Constructs a new Invoke.
	 */
    public Invoke() {
		super();
	}

	/** {@inheritDoc} */
    @Override
	public byte getDataType() {
		return TYPE_INVOKE;
	}

    /**
     * Create new invocation event with given data.
     * 
     * @param data        Event data
     */
    public Invoke(ByteBuffer data) {
		super(data);
	}

    /**
     * Create new invocation event with given pending service call.
     * 
     * @param call         Pending call
     */
    public Invoke(IPendingServiceCall call) {
		super(call);
	}

	/** {@inheritDoc} */
    @Override
	public IPendingServiceCall getCall() {
		return (IPendingServiceCall) call;
	}

	/** {@inheritDoc} */
    @Override
	public String toString() {
		StringBuffer sb = new StringBuffer();
		sb.append("Invoke: ").append(call);
		return sb.toString();
	}

	/** {@inheritDoc} */
    @Override
	public boolean equals(Object obj) {
		if (obj == null) {
			return false;
		}
		if (!(obj instanceof Invoke)) {
			return false;
		}
		return super.equals(obj);
	}

}
