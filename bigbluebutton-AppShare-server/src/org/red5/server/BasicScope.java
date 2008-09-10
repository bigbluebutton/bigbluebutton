package org.red5.server;

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

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.red5.server.api.IBasicScope;
import org.red5.server.api.IScope;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.event.IEventListener;

// TODO: Auto-generated Javadoc
/**
 * Generalizations of one of main Red5 object types, Scope.
 * Basic scope is a persistable attribute store with event handling functionality
 * 
 * @see org.red5.server.api.IScope
 * @see org.red5.server.Scope
 */
public abstract class BasicScope extends PersistableAttributeStore implements
		IBasicScope {
    
    /** Parent scope. Scopes can be nested. */
	protected IScope parent;
    
    /** List of event listeners. */
	protected Set<IEventListener> listeners;
    
    /** Scope persistence storate type. */
	protected String persistenceClass;
	
	/** Set to true to prevent the scope from being freed upon disconnect. */
	protected boolean keepOnDisconnect = false;

    /**
     * Constructor for basic scope.
     * 
     * @param parent           Parent scope
     * @param type             Scope type
     * @param name             Scope name. Used to identify scopes in application, must be unique among scopes of one level
     * @param persistent       Whether scope is persistent
     */
	public BasicScope(IScope parent, String type, String name,
			boolean persistent) {
		super(type, name, null, persistent);
		this.parent = parent;
		this.listeners = new HashSet<IEventListener>();
	}

    /**
     * {@inheritDoc}
     */
	public boolean hasParent() {
		return true;
	}

    /**
     *{@inheritDoc}
     */
	public IScope getParent() {
		return parent;
	}

    /**
     *{@inheritDoc}
     */
	public int getDepth() {
		return parent.getDepth() + 1;
	}

    /**
     *{@inheritDoc}
     */
	@Override
	public String getPath() {
		return parent.getPath() + '/' + parent.getName();
	}

    /**
     * Add event listener to list of notified objects.
     * 
     * @param listener        Listening object
     */
	public void addEventListener(IEventListener listener) {
		listeners.add(listener);
	}

    /**
     * Remove event listener from list of listeners.
     * 
     * @param listener            Listener to remove
     */
	public void removeEventListener(IEventListener listener) {
		listeners.remove(listener);
		if (!keepOnDisconnect && ScopeUtils.isRoom(this) && listeners.isEmpty()) {
			// Delete empty rooms
			parent.removeChildScope(this);
		}
	}

    /**
     * Return listeners list iterator.
     * 
     * @return  Listeners list iterator
     */
	public Iterator<IEventListener> getEventListeners() {
		return listeners.iterator();
	}

    /**
     * Handles event. To be implemented in subclass realization
     * 
     * @param event          Event context
     * 
     * @return               Event handling result
     */
    public boolean handleEvent(IEvent event) {
		// do nothing.
		return false;
	}

    /**
     * Notifies listeners on event. Current implementation is empty. To be implemented in subclass realization
     * 
     * @param event      Event to broadcast
     */
	public void notifyEvent(IEvent event) {

	}

    /**
     * Dispatches event (notifies all listeners).
     * 
     * @param event        Event to dispatch
     */
    public void dispatchEvent(IEvent event) {
		for (IEventListener listener : listeners) {
			if (event.getSource() == null || event.getSource() != listener) {
				listener.notifyEvent(event);
			}
		}
	}

    /**
     * Getter for subscopes list iterator. Returns null because this is a base implementation
     * 
     * @return           Iterator for subscopes
     */
    public Iterator<IBasicScope> iterator() {
		return null;
	}

    /**
     * Iterator for basic scope.
     */
    public class EmptyBasicScopeIterator implements Iterator<IBasicScope> {

		/** {@inheritDoc} */
        public boolean hasNext() {
			return false;
		}

		/** {@inheritDoc} */
        public IBasicScope next() {
			return null;
		}

		/** {@inheritDoc} */
        public void remove() {
			// nothing
		}

	}

}
