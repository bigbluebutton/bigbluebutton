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

package org.bigbluebuttonproject.presentation;
// TODO: Auto-generated Javadoc

/**
 * This class has the key words used in the update messages passed to BigBlueButton servlet.
 * 
 * When making changes to this class, make sure you also change
 * org.bigbluebuttonproject.fileupload.document.impl.ReturnCode
 * in the FileUpload Application.
 */
public enum ReturnCode {
	
	/** The FAIL. */
	FAIL (0, "FAIL <UNKNOWN>"),
	
	/** The WRON g_ format. */
	WRONG_FORMAT (1, "WRONG FORMAT"),
	
	/** The O o_ connection. */
	OO_CONNECTION (2, "OPEN OFFICE CONNECTION"),
	
	/** The FIL e_ no t_ found. */
	FILE_NOT_FOUND (3, "FILE NOT FOUND"),
	
	/** The SWFTOOLS. */
	SWFTOOLS (4, "SWFTOOLS"),
	
	/** The EXTRACT. */
	EXTRACT (5, "EXTRACT"),
	
	/** The CONVERT. */
	CONVERT (6, "CONVERT"),
	
	/** The UPDATE. */
	UPDATE (7, "UPDATE"),
	
	/** The SUCCESS. */
	SUCCESS (8, "SUCCESS");
	
	/** The code. */
	private final String code;
	
	/** The value. */
	private final int value;
	
	/**
	 * Instantiates a new return code.
	 * 
	 * @param value the value
	 * @param code the code
	 */
	ReturnCode(int value, String code) {
		this.value = value;
		this.code = code;
	}
	
	/**
	 * Code.
	 * 
	 * @return the string
	 */
	public String code() {
		return code;
	}
	
	/**
	 * Value.
	 * 
	 * @return the value
	 */
	public int value() {
		return value;
	}
}
