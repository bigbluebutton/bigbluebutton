package org.red5.server.adapter;

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

import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Base class for applications, takes care that callbacks are executed single-threaded.
 * If you want to have maximum performance, use {@link MultiThreadedApplicationAdapter}
 * instead.
 * 
 * Using this class may lead to problems if accepting a client in the <code>*Connect</code>
 * or <code>*Join</code> methods takes too long, so using the multithreaded version is
 * preferred.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class ApplicationAdapter extends MultiThreadedApplicationAdapter {

	/** Logger object. */
	protected static Logger log = LoggerFactory.getLogger(ApplicationAdapter.class
			.getName());

	/** {@inheritDoc} */
	@Override
	public synchronized boolean connect(IConnection conn, IScope scope, Object[] params) {
		return super.connect(conn, scope, params);
	}

	/** {@inheritDoc} */
	@Override
	public synchronized void disconnect(IConnection conn, IScope scope) {
		super.disconnect(conn, scope);
	}
	
	/** {@inheritDoc} */
	@Override
	public synchronized boolean start(IScope scope) {
		return super.start(scope);
	}
	
	/** {@inheritDoc} */
	@Override
	public synchronized void stop(IScope scope) {
		super.stop(scope);
	}
	
	/** {@inheritDoc} */
	@Override
	public synchronized boolean join(IClient client, IScope scope) {
		return super.join(client, scope);
	}
	
	/** {@inheritDoc} */
	@Override
	public synchronized void leave(IClient client, IScope scope) {
		super.leave(client, scope);
	}
	
}
