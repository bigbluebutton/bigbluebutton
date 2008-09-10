package org.red5.io.mp3.impl;

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

import java.io.File;
import java.io.IOException;

import org.red5.io.ITagReader;
import org.red5.io.ITagWriter;
import org.red5.io.mp3.IMP3;

// TODO: Auto-generated Javadoc
/**
 * Represents MP3 file.
 */
public class MP3 implements IMP3 {
    
    /** Actual file object. */
	private File file;

    /**
     * Creates MP3 object using given file.
     * 
     * @param file           File object to use
     */
    public MP3(File file) {
		this.file = file;
	}

	/** {@inheritDoc} */
    public ITagReader getReader() throws IOException {
		return new MP3Reader(file);
	}

	/** {@inheritDoc} */
    public ITagWriter getWriter() throws IOException {
		return null;
	}

	/** {@inheritDoc} */
    public ITagWriter getAppendWriter() throws IOException {
		return null;
	}

}
