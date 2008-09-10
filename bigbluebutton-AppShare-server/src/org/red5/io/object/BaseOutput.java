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
 * BaseOutput represents a way to map input to a HashMap.  This class
 * is meant to be extended.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard, Codegent Ltd (luke@codegent.com)
 */
public class BaseOutput {

	/**
	 * The Class IdentityWrapper.
	 */
	class IdentityWrapper {
        
        /** Wrapped object. */
		Object object;

        /**
         * Creates wrapper for object.
         * 
         * @param object        Object to wrap
         */
        public IdentityWrapper(Object object) {
			this.object = object;
		}

		/** {@inheritDoc} */
        @Override
		public int hashCode() {
			return System.identityHashCode(object);
		}

		/** {@inheritDoc} */
        @Override
		public boolean equals(Object object) {
			if (object instanceof IdentityWrapper) {
				return ((IdentityWrapper) object).object == this.object;
			}

			return false;
		}

	}

    /** References map. */
    protected Map<IdentityWrapper, Short> refMap;

    /** Reference id. */
    protected short refId;

	/**
	 * BaseOutput Constructor.
	 */
	protected BaseOutput() {
		refMap = new HashMap<IdentityWrapper, Short>();
	}

	/**
	 * Store an object into a map.
	 * 
	 * @param obj   Object to store
	 */
	protected void storeReference(Object obj) {
		refMap.put(new IdentityWrapper(obj), Short.valueOf(refId++));
	}

	/**
	 * Returns a boolean stating whether the map contains an object with
	 * that key.
	 * 
	 * @param obj            Object
	 * 
	 * @return boolean       <code>true</code> if it does contain it, <code>false</code> otherwise
	 */
	protected boolean hasReference(Object obj) {
		return refMap.containsKey(new IdentityWrapper(obj));
	}

	/**
	 * Clears the map.
	 */
	public void clearReferences() {
		refMap.clear();
		refId = 0;
	}

	/**
	 * Returns the reference id based on the parameter obj.
	 * 
	 * @param obj            Object
	 * 
	 * @return short         Reference id
	 */
	protected short getReferenceId(Object obj) {
		return refMap.get(new IdentityWrapper(obj)).shortValue();
	}

}
