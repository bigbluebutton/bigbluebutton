package org.red5.server.war;

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
 
import java.rmi.RemoteException;
import java.util.ArrayList;

// TODO: Auto-generated Javadoc
/**
 * The Class RemotableList.
 */
public class RemotableList extends ArrayList<WebSettings> implements
		IRemotableList {

	/** The Constant serialVersionUID. */
	private final static long serialVersionUID = 419197182007L;

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#addChild(org.red5.server.war.WebSettings)
	 */
	public boolean addChild(WebSettings settings) throws RemoteException {
		return super.add(settings);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#clearList()
	 */
	public void clearList() throws RemoteException {
		super.clear();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#getAt(int)
	 */
	public WebSettings getAt(int index) throws RemoteException {
		return super.get(index);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#indexOf(org.red5.server.war.WebSettings)
	 */
	public int indexOf(WebSettings settings) throws RemoteException {
		return super.indexOf(settings);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#hasChildren()
	 */
	public boolean hasChildren() throws RemoteException {
		return !super.isEmpty();
	}

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#removeAt(int)
	 */
	public WebSettings removeAt(int index) throws RemoteException {
		return super.remove(index);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.war.IRemotableList#numChildren()
	 */
	public int numChildren() throws RemoteException {
		return super.size();
	}

}