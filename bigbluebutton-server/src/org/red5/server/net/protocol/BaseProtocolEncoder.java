package org.red5.server.net.protocol;

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

import java.util.ArrayList;
import java.util.List;

import org.red5.server.exception.ClientDetailsException;
import org.red5.server.net.rtmp.status.StatusObject;

// TODO: Auto-generated Javadoc
/**
 * Base class for all protocol encoders.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public abstract class BaseProtocolEncoder implements SimpleProtocolEncoder {


	/**
	 * Generate error object to return for given exception.
	 * 
	 * @param code the code
	 * @param error the error
	 * 
	 * @return the status object
	 */
	protected StatusObject generateErrorResult(String code, Throwable error) {
		// Construct error object to return
		String message = "";
		while (error != null && error.getCause() != null) {
			error = error.getCause();
		}
		if (error != null && error.getMessage() != null) {
			message = error.getMessage();
		}
		StatusObject status = new StatusObject(code, "error", message);
		if (error instanceof ClientDetailsException) {
			// Return exception details to client
			status.setApplication(((ClientDetailsException) error).getParameters());
			if (((ClientDetailsException) error).includeStacktrace()) {
				List<String> stack = new ArrayList<String>();
				for (StackTraceElement element: error.getStackTrace()) {
					stack.add(element.toString());
				}
				status.setAdditional("stacktrace", stack);
			}
		} else if (error != null) {
			status.setApplication(error.getClass().getCanonicalName());
		}
		return status;
	}
	
}
