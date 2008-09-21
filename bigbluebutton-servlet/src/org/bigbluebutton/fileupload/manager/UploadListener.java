/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/

package org.bigbluebutton.fileupload.manager;

import java.util.ArrayList;

import org.bigbluebutton.fileupload.document.IProgressListener;
// TODO: Auto-generated Javadoc

/**
 * The Class UploadListener.
 * 
 * @author ritzalam
 */
public class UploadListener implements IProgressListener{
	
	/** The room no. */
	private String roomNo;
	
	/** The messages. */
	private ArrayList <String> messages = new ArrayList <String> ();
	
	/* (non-Javadoc)
	 * @see org.blindsideproject.fileupload.document.IProgressListener#update(java.lang.String)
	 */
	public void update(String newMessage)
	{
	}
		
	/**
	 * Instantiates a new upload listener.
	 * 
	 * @param roomNo the room no
	 */
	public UploadListener (String roomNo)
	{
		this.roomNo = roomNo;
	}
		
	/**
	 * Adds the updated messages.
	 * 
	 * @param newMessage the new message
	 */
	public void addUpdatedMessages(String newMessage)
	{
		messages.add(newMessage);
	}
	
	/**
	 * Gets the updated messages.
	 * 
	 * @return the updated messages
	 */
	public ArrayList getUpdatedMessages()
	{
		return messages;
	}
	
	/**
	 * Sets the array list.
	 * 
	 * @param messages the new array list
	 */
	public void setArrayList(ArrayList<String> messages)
	{
		this.messages = messages;
	}

}
