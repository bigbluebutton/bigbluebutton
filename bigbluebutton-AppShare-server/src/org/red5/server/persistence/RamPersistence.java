package org.red5.server.persistence;

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

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.red5.server.api.IScope;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.persistence.IPersistable;
import org.red5.server.api.persistence.IPersistenceStore;
import org.springframework.core.io.support.ResourcePatternResolver;

// TODO: Auto-generated Javadoc
/**
 * Persistence implementation that stores the objects in memory.
 * This serves as default persistence if nothing has been configured.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 * @author Michael Klishin (michael@novemberain.com)
 */
public class RamPersistence implements IPersistenceStore {

	/** This is used in the id for objects that have a name of <code>null</code> *. */
	protected static final String PERSISTENCE_NO_NAME = "__null__";

    /** Map for persistable objects. */
    protected Map<String, IPersistable> objects = new ConcurrentHashMap<String, IPersistable>();

    /** Resource pattern resolver. Resolves resources from patterns, loads resources. */
    protected ResourcePatternResolver resources;

    /**
     * Creates RAM persistence object from resource pattern resolvers.
     * 
     * @param resources            Resource pattern resolver and loader
     */
    public RamPersistence(ResourcePatternResolver resources) {
		this.resources = resources;
	}

    /**
     * Creates RAM persistence object from scope.
     * 
     * @param scope                Scope
     */
	public RamPersistence(IScope scope) {
		this((ResourcePatternResolver) ScopeUtils.findApplication(scope));
	}

    /**
     * Get resource name from path.
     * 
     * @param id                   Object ID. The format of the object id is <type>/<path>/<objectName>.
     * 
     * @return                     Resource name
     */
    protected String getObjectName(String id) {
		// The format of the object id is <type>/<path>/<objectName>
		String result = id.substring(id.lastIndexOf('/') + 1);
		if (result.equals(PERSISTENCE_NO_NAME)) {
			result = null;
		}
		return result;
	}

    /**
     * Get object path for given id and name.
     * 
     * @param id                   Object ID. The format of the object id is <type>/<path>/<objectName>
     * @param name                 Object name
     * 
     * @return                     Resource path
     */
	protected String getObjectPath(String id, String name) {
		// The format of the object id is <type>/<path>/<objectName>
		id = id.substring(id.indexOf('/') + 1);
		if (id.charAt(0) == '/') {
			id = id.substring(1);
		}
		if (id.lastIndexOf(name) <= 0) {
			return id;
		}
		return id.substring(0, id.lastIndexOf(name)-1);
	}

    /**
     * Get object id.
     * 
     * @param object               Persistable object whose id is asked for
     * 
     * @return                     Given persistable object id
     */
	protected String getObjectId(IPersistable object) {
		// The format of the object id is <type>/<path>/<objectName>
		String result = object.getType();
		if (object.getPath().charAt(0) != '/') {
			result += '/';
		}
		result += object.getPath();
		if (!result.endsWith("/")) {
			result += '/';
		}
		String name = object.getName();
		if (name == null) {
			name = PERSISTENCE_NO_NAME;
		}
		if (name.charAt(0) == '/') {
			// "result" already ends with a slash
			name = name.substring(1);
		}
		return result + name;
	}

	/** {@inheritDoc} */
    public boolean save(IPersistable object) {
        final String key = getObjectId(object);
        
        objects.put(key, object);
        object.setPersistent(true);
        return true;
    }

	/** {@inheritDoc} */
    public IPersistable load(String name) {
		return objects.get(name);
	}

	/** {@inheritDoc} */
    public boolean load(IPersistable obj) {
		return obj.isPersistent();
	}

	/** {@inheritDoc} */
    public boolean remove(IPersistable object) {
		return remove(getObjectId(object));
	}

	/** {@inheritDoc} */
    public boolean remove(String name) {
    	synchronized (objects) {
			if (!objects.containsKey(name)) {
				return false;
			}
	
			IPersistable object = objects.remove(name);
			object.setPersistent(false);
    	}
		return true;
	}

	/** {@inheritDoc} */
    public Set<String> getObjectNames() {
		return objects.keySet();
	}

	/** {@inheritDoc} */
    public Collection<IPersistable> getObjects() {
		return objects.values();
	}

	/** {@inheritDoc} */
	public void notifyClose() {
		objects.clear();
	}
}
