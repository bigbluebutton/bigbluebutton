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

package org.bigbluebutton.fileupload;


import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;


/**
 * The Interface ISlideDatabase.
 * 
 * @author ritzalam
 */
public interface ISlideDatabase {

	/**
	 * Gets the slides for room.
	 * 
	 * @param room the room
	 * 
	 * @return the slides for room
	 */
	public List<SlideDescriptor> getSlidesForRoom(Integer room);
	
	/**
	 * Gets the thumbnails for room.
	 * 
	 * @param room the room
	 * 
	 * @return the thumbnails for room
	 */
	public List<SlideDescriptor> getThumbnailsForRoom(Integer room);
	
	/**
	 * Save uploaded file.
	 * 
	 * @param multipartFile the multipart file
	 * @param room the room
	 * 
	 * @return the file
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public File saveUploadedFile(MultipartFile multipartFile, Integer room) throws IOException;
	
	/**
	 * Stream image.
	 * 
	 * @param room the room
	 * @param name the name
	 * @param os the os
	 */
	public void streamImage(Integer room, String name, OutputStream os);
	
	/**
	 * Gets the xml.
	 * 
	 * @param room the room
	 * @param name the name
	 * @param os the os
	 * 
	 * @return the xml
	 */
	public void getXml(Integer room, String name, OutputStream os);
	
	/**
	 * Gets the slides in xml.
	 * 
	 * @param room the room
	 * 
	 * @return the slides in xml
	 */
	public String getSlidesInXml(Integer room);
	
	/**
	 * Creates the default xml.
	 * 
	 * @param room the room
	 */
	public void createDefaultXml(Integer room);
	
	/**
	 * Clear database.
	 */
	public void clearDatabase();
}
  