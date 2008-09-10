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

import org.red5.server.api.IScope;
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.stream.IStream;
import org.red5.server.api.stream.IStreamAwareScopeHandler;
import org.red5.server.api.stream.IStreamCodecInfo;

// TODO: Auto-generated Javadoc
/**
 * Abstract base implementation of IStream. Contains codec information, stream name, scope, event handling
 * meand, provides stream start and stop operations.
 * 
 * @see  org.red5.server.api.stream.IStream
 */
public abstract class AbstractStream implements IStream {
    
    /** Stream name. */
    private String name;
    
    /** Stream audio and video codecs information. */
	private IStreamCodecInfo codecInfo;
    
    /** Stream scope. */
	private IScope scope;
    
    /**
     * Return stream name.
     * 
     * @return     Stream name
     */
	public String getName() {
		return name;
	}

    /**
     * Return codec information.
     * 
     * @return              Stream codec information
     */
    public IStreamCodecInfo getCodecInfo() {
		return codecInfo;
	}

    /**
     * Return scope.
     * 
     * @return         Scope
     */
    public IScope getScope() {
		return scope;
	}

    /**
     * Setter for name.
     * 
     * @param name     Stream name
     */
	public void setName(String name) {
		this.name = name;
	}

    /**
     * Setter for codec info.
     * 
     * @param codecInfo     Codec info
     */
    public void setCodecInfo(IStreamCodecInfo codecInfo) {
		this.codecInfo = codecInfo;
	}

    /**
     * Setter for scope.
     * 
     * @param scope         Scope
     */
	public void setScope(IScope scope) {
		this.scope = scope;
	}

    /**
     * Return stream aware scope handler or null if scope is null.
     * 
     * @return      IStreamAwareScopeHandler implementation
     */
	protected IStreamAwareScopeHandler getStreamAwareHandler() {
		if (scope != null) {
			IScopeHandler handler = scope.getHandler();
			if (handler instanceof IStreamAwareScopeHandler) {
				return (IStreamAwareScopeHandler) handler;
			}
		}
		return null;
	}
}
