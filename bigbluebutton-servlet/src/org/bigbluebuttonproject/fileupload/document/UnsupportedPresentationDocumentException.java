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

package org.bigbluebuttonproject.fileupload.document;

import org.bigbluebuttonproject.fileupload.document.BaseException;

// TODO: Auto-generated Javadoc
/**
 * Exception class used when unsupported presentation file format error occurs.
 * 
 * @author ritzalam
 */
public class UnsupportedPresentationDocumentException extends BaseException {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 610367372614072528L;

	/**
	 * Instantiates a new unsupported presentation document exception.
	 */
	public UnsupportedPresentationDocumentException()
	{
		super();
	}
  
	/**
	 * Instantiates a new unsupported presentation document exception.
	 * 
	 * @param message the message
	 */
	public UnsupportedPresentationDocumentException(String message)
	{
		super(message);
	}

	/**
	 * Instantiates a new unsupported presentation document exception.
	 * 
	 * @param e the e
	 */
	public UnsupportedPresentationDocumentException(Exception e)
	{
		super(e);
	}

	/**
	 * Instantiates a new unsupported presentation document exception.
	 * 
	 * @param message the message
	 * @param e the e
	 */
	public UnsupportedPresentationDocumentException(String message, Exception e)
	{
		super(message, e);
	}
}
  