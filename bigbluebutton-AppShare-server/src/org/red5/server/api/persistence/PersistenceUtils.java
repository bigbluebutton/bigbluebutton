package org.red5.server.api.persistence;

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

import java.lang.reflect.Constructor;

import org.springframework.core.io.support.ResourcePatternResolver;

// TODO: Auto-generated Javadoc
/**
 * Helper class for persistence.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */

public class PersistenceUtils {

	/**
	 * Returns persistence store object class constructor.
	 * 
	 * @param theClass Persistence store class
	 * @param interfaces Interfaces that are being implemented by persistence store
	 * object class
	 * 
	 * @return 			Constructor
	 * 
	 * @throws Exception the exception
	 */
	private static Constructor<?> getPersistenceStoreConstructor(Class<?> theClass,
			Class<?>[] interfaces) throws Exception {
		Constructor<?> constructor = null;
		for (Class<?> interfaceClass : interfaces) {
			try {
				constructor = theClass
						.getConstructor(new Class[] { interfaceClass });
			} catch (NoSuchMethodException err) {
				// Ignore this error
			}
			if (constructor != null) {
				break;
			}

			constructor = getPersistenceStoreConstructor(theClass,
					interfaceClass.getInterfaces());
			if (constructor != null) {
				break;
			}
		}
		return constructor;
	}

	/**
	 * Returns persistence store object. Persistence store is a special object
	 * that stores persistence objects and provides methods to manipulate them
	 * (save, load, remove, list).
	 * 
	 * @param resolver Resolves connection pattern into Resource object
	 * @param className Name of persistence class
	 * 
	 * @return IPersistence store object that provides methods for persistence
	 * object handling
	 * 
	 * @throws Exception the exception
	 */
	public static IPersistenceStore getPersistenceStore(
			ResourcePatternResolver resolver, String className)
			throws Exception {
		Class<?> persistenceClass = Class.forName(className);
		Constructor<?> constructor = getPersistenceStoreConstructor(
				persistenceClass, resolver.getClass().getInterfaces());
		if (constructor == null) {
			// Search in superclasses of the object.
			Class<?> superClass = resolver.getClass().getSuperclass();
			while (superClass != null) {
				constructor = getPersistenceStoreConstructor(persistenceClass,
						superClass.getInterfaces());
				if (constructor != null) {
					break;
				}

				superClass = superClass.getSuperclass();
			}
		}

		if (constructor == null) {
			throw new NoSuchMethodException();
		}

		return (IPersistenceStore) constructor
				.newInstance(new Object[] { resolver });
	}

}
