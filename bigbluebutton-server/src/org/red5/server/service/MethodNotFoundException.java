package org.red5.server.service;

import java.util.Arrays;

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
 * Thrown if service method is not found so call throws exception.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class MethodNotFoundException extends RuntimeException {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 7559230924102506068L;

    /**
     * Creates exception with given method name.
     * 
     * @param methodName      Service method name that can't be found
     */
    public MethodNotFoundException(String methodName) {
		super("Method " + methodName + " without arguments not found");
	}

    /**
     * Creates exception with given method name and arguments.
     * 
     * @param methodName      Service method name that can't be found
     * @param args 		  Arguments given
     */
    public MethodNotFoundException(String methodName, Object[] args) {
		super("Method " + methodName + " with arguments " + Arrays.asList(args) + " not found");
	}

}
