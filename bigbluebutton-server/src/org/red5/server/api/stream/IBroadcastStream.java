package org.red5.server.api.stream;

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

import java.io.IOException;
import java.util.Collection;

import org.red5.server.messaging.IProvider;

// TODO: Auto-generated Javadoc
/**
 * A broadcast stream is a stream source to be subscribed by clients. To
 * subscribe a stream from your client Flash application use NetStream.play
 * method. Broadcast stream can be saved at server-side.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IBroadcastStream extends IStream {

	/**
	 * Save the broadcast stream as a file.
	 * 
	 * @param filePath The path of the file relative to the scope.
	 * @param isAppend Whether to append to the end of file.
	 * 
	 * @throws IOException File could not be created/written to.
	 * @throws ResourceExistException Resource exist when trying to create.
	 * @throws ResourceNotFoundException Resource not exist when trying to append.
	 */
	void saveAs(String filePath, boolean isAppend)
            throws IOException, ResourceNotFoundException, ResourceExistException;

	/**
	 * Get the filename the stream is being saved as.
	 * 
	 * @return The filename relative to the scope or <code>null</code>
	 * if the stream is not being saved.
	 */
	String getSaveFilename();
	
	/**
	 * Get the provider corresponding to this stream. Provider objects are
	 * object that
	 * 
	 * @return the provider
	 */
	IProvider getProvider();

	/**
	 * Get stream publish name. Publish name is the value of the first parameter
	 * had been passed to <code>NetStream.publish</code> on client side in
	 * SWF.
	 * 
	 * @return Stream publish name
	 */
	String getPublishedName();

	/**
	 * Sets the published name.
	 * 
	 * @param name Set stream publish name
	 */
	void setPublishedName(String name);

	/**
	 * Add a listener to be notified about received packets.
	 * 
	 * @param listener the listener to add
	 */
	public void addStreamListener(IStreamListener listener);
	
	/**
	 * Remove a listener from being notified about received packets.
	 * 
	 * @param listener the listener to remove
	 */
	public void removeStreamListener(IStreamListener listener);
	
	/**
	 * Return registered stream listeners.
	 * 
	 * @return the registered listeners
	 */
	public Collection<IStreamListener> getStreamListeners();
	
}