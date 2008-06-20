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


package org.bigbluebuttonproject.fileupload;
import org.springframework.util.Assert;


/**
 * Entity class used to create instances that describe slides: name and conference room ID.
 * 
 * @author ritzalam
 */
public class SlideDescriptor {

	// name of the slide
	/** The name. */
	private final String name;
	// conference room ID
	/** The room. */
	private final Integer room;

	/**
	 * Instantiates a new slide descriptor.
	 * 
	 * @param name the name
	 * @param room the room
	 */
	public SlideDescriptor(String name, Integer room) {
		Assert.notNull(name, "No image name specified");
		this.name = name;
		this.room = room;
	}
	
	/**
	 * getter for slide name.
	 * 
	 * @return name of the slide
	 */
	public String getName() {
		return name;
	}
	
	/**
	 * getter for conference room ID.
	 * 
	 * @return conference room ID
	 */
	public Integer getRoom() {
		return room;
	}
}
