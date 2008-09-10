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

import org.red5.server.api.IScope;
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.service.IServiceHandlerProvider;
import org.red5.server.api.service.IServiceHandlerProviderAware;

// TODO: Auto-generated Javadoc
/**
 * Allow scope handlers to create service handlers dynamically.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class HandlerServiceResolver implements IServiceResolver {

	/** {@inheritDoc} */
    public Object resolveService(IScope scope, String serviceName) {
		IScopeHandler handler = scope.getHandler();
		if (handler instanceof IServiceHandlerProvider) {
			// TODO: deprecate this?
			Object result = ((IServiceHandlerProvider) handler)
					.getServiceHandler(serviceName);
			if (result != null) {
				return result;
			}
		}

		if (handler instanceof IServiceHandlerProviderAware) {
			IServiceHandlerProvider shp = ((IServiceHandlerProviderAware) handler)
					.getServiceHandlerProvider();
			if (shp != null) {
				return shp.getServiceHandler(serviceName);
			}
		}

		return null;
	}

}
