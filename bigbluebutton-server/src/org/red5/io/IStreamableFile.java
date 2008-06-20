package org.red5.io;

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

// TODO: Auto-generated Javadoc
/**
 * Interface represents streamable file with tag reader and writers (one for plain mode and one for append).
 */
public interface IStreamableFile {

	/**
	 * Returns a reader to parse and read the tags inside the file.
	 * 
	 * @return the reader                 Tag reader
	 * 
	 * @throws java.io.IOException        I/O exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public ITagReader getReader() throws IOException;

	/**
	 * Returns a writer that creates a new file or truncates existing contents.
	 * 
	 * @return the writer                  Tag writer
	 * 
	 * @throws java.io.IOException         I/O exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public ITagWriter getWriter() throws IOException;

	/**
	 * Returns a Writer which is setup to append to the file.
	 * 
	 * @return the writer                  Tag writer used for append mode
	 * 
	 * @throws java.io.IOException         I/O exception
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public ITagWriter getAppendWriter() throws IOException;

}
