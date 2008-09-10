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
 
import java.rmi.Remote;
import java.rmi.RemoteException;

// TODO: Auto-generated Javadoc
/**
 * The Interface IRemotableList.
 */
public interface IRemotableList extends Remote {

	/**
	 * Adds the child.
	 * 
	 * @param settings the settings
	 * 
	 * @return true, if successful
	 * 
	 * @throws RemoteException the remote exception
	 */
	public boolean addChild(WebSettings settings) throws RemoteException;

	/**
	 * Clear list.
	 * 
	 * @throws RemoteException the remote exception
	 */
	public void clearList() throws RemoteException;

	/**
	 * Gets the at.
	 * 
	 * @param index the index
	 * 
	 * @return the at
	 * 
	 * @throws RemoteException the remote exception
	 */
	public WebSettings getAt(int index) throws RemoteException;

	/**
	 * Index of.
	 * 
	 * @param settings the settings
	 * 
	 * @return the int
	 * 
	 * @throws RemoteException the remote exception
	 */
	public int indexOf(WebSettings settings) throws RemoteException;

	/**
	 * Checks for children.
	 * 
	 * @return true, if successful
	 * 
	 * @throws RemoteException the remote exception
	 */
	public boolean hasChildren() throws RemoteException;

	/**
	 * Removes the at.
	 * 
	 * @param index the index
	 * 
	 * @return the web settings
	 * 
	 * @throws RemoteException the remote exception
	 */
	public WebSettings removeAt(int index) throws RemoteException;

	/**
	 * Num children.
	 * 
	 * @return the int
	 * 
	 * @throws RemoteException the remote exception
	 */
	public int numChildren() throws RemoteException;

}