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

package org.bigbluebutton.fileupload.document.impl;

import org.bigbluebutton.fileupload.document.impl.PptToJpegConverter;



/**
 * The Class SlideInfo.
 */
public class SlideInfo{

	/**
	 * Instantiates a new slide info.
	 * 
	 * @param strName the str name
	 * @param strPath the str path
	 * @param format the format
	 */
	public SlideInfo(String strName, String strPath, PptToJpegConverter format){
		this.strName = strName;
		this.strPath = strPath;
		this.format = format;
	}


	/**
	 * Gets the name.
	 * 
	 * @return the name
	 */
	public String getName(){
		return strName;
	}
	
	/**
	 * Gets the path.
	 * 
	 * @return the path
	 */
	public String getPath(){
		return strPath;
	}
	
	/**
	 * Gets the format.
	 * 
	 * @return the format
	 */
	public PptToJpegConverter getFormat(){
		return format;
	}
	
	/** The str name. */
	private String strName;
	
	/** The str path. */
	private String strPath;
	
	/** The format. */
	private PptToJpegConverter format;

}