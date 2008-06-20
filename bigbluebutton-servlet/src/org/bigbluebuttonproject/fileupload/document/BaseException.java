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
// TODO: Auto-generated Javadoc

/**
 * Exception class used in servlet classes, which inherits  java.lang.Exception
 * 
 * @author ritzalam
 */

public class BaseException extends java.lang.Exception
{
	
	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 3608396488252900444L;
	
	/** The message. */
	private String message = "";
	
	/** The exception. */
	private Exception exception = null;

	/**
	 * Instantiates a new base exception.
	 */
	public BaseException()
	{
		super();
	}

	/**
	 * Instantiates a new base exception.
	 * 
	 * @param message the message
	 */
	public BaseException(String message)
	{
		super();
		this.message = message;
	    this.exception = null;
	}

	/**
	 * Instantiates a new base exception.
	 * 
	 * @param e the e
	 */
	public BaseException(Exception e)
	{
		super();
		this.message = this.getClass().getName();
		this.exception = e;
	}

	/**
	 * Instantiates a new base exception.
	 * 
	 * @param message the message
	 * @param e the e
	 */
	public BaseException(String message, Exception e)
	{
		super();
		this.message = message;
		this.exception = e;
	}

	/* (non-Javadoc)
	 * @see java.lang.Throwable#getMessage()
	 */
	public String getMessage()
	{
		if ( ( (message == null) || (message.length() == 0)) && exception != null)
		{
			return exception.getMessage();
		}
		else
		{
			return this.message;
		}
	}

	/**
	 * Gets the exception.
	 * 
	 * @return the exception
	 */
	public Exception getException()
	{
		return exception;
	}

	/* (non-Javadoc)
	 * @see java.lang.Throwable#toString()
	 */
	public String toString()
	{
		return getMessage();
	}

	/* (non-Javadoc)
	 * @see java.lang.Throwable#printStackTrace()
	 */
	public void printStackTrace()
	{
		super.printStackTrace();
		if (exception != null)
		{
			System.err.println();
			System.err.println("Embedded exception:");
			exception.printStackTrace();
		}
	}

	/* (non-Javadoc)
	 * @see java.lang.Throwable#printStackTrace(java.io.PrintStream)
	 */
	public void printStackTrace(java.io.PrintStream s)
	{
		super.printStackTrace(s);
		if (exception != null)
		{
			s.println();
			s.println("Embedded exception:");
			exception.printStackTrace(s);
		}
	} 
	
	/* (non-Javadoc)
	 * @see java.lang.Throwable#printStackTrace(java.io.PrintWriter)
	 */
	public void printStackTrace(java.io.PrintWriter s)
	{
		super.printStackTrace(s);
		if (exception != null)
		{
			s.println();
			s.println("Embedded exception:");
			exception.printStackTrace(s);
		}
	}
}
