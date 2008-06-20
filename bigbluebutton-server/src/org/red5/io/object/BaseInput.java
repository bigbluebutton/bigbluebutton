package org.red5.io.object;

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

import java.util.HashMap;
import java.util.Map;

// TODO: Auto-generated Javadoc
/**
 * BaseInput represents a way to map input to a HashMap.  This class
 * is meant to be extended.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class BaseInput {
	
	/**
	 * Mode how references should be handled.
	 */
	public enum ReferenceMode {
		
		/** The MOD e_ rtmp. */
		MODE_RTMP,
		
		/** The MOD e_ remoting. */
		MODE_REMOTING,
	};
	
    /** References map. */
	protected Map<Integer, Object> refMap = new HashMap<Integer, Object>();

    /** References id. */
    protected int refId;
    
    /** Mode how to handle references. */
    protected ReferenceMode referenceMode = ReferenceMode.MODE_RTMP;

	/**
	 * Store an object into a map.
	 * 
	 * @param obj  Object to store
	 * 
	 * @return the int
	 */
	protected int storeReference(Object obj) {
		int newRefId = refId++;
		refMap.put(Integer.valueOf(newRefId), obj);
		return newRefId;
	}

	/**
	 * Replace a referenced object with another one. This is used
	 * by the AMF3 deserializer to handle circular references.
	 * 
	 * @param refId the ref id
	 * @param newRef the new ref
	 */
	protected void storeReference(int refId, Object newRef) {
		refMap.put(Integer.valueOf(refId), newRef);
	}
	
	/**
	 * Clears the map.
	 */
	public void clearReferences() {
		refMap.clear();
		refId = 0;
	}

	/**
	 * Returns the object with the parameters id.
	 * 
	 * @param id        Object reference id
	 * 
	 * @return Object   Object reference with given id
	 */
	protected Object getReference(int id) {
		return refMap.get(Integer.valueOf(id));
	}

}
