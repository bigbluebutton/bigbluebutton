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

import java.io.File;
import java.io.IOException;

// TODO: Auto-generated Javadoc
/**
 * Provides access to files that can be streamed.
 */
public interface IStreamableFileService {

	/**
	 * Getter for prefix. Prefix is used in filename composition to fetch real file name.
	 * 
	 * @return  Prefix
	 */
    public String getPrefix();

	/**
	 * Getter for extension of file.
	 * 
	 * @return  File extension that is used
	 */
    public String getExtension();

    /**
     * Prepair given string to conform filename requirements, for example, add
     * extension to the end if missing.
     * 
     * @param name            String to format
     * 
     * @return                Correct filename
     */
    public String prepareFilename(String name);

    /**
     * Check whether file can be used by file service, that is, it does exist and have valid extension.
     * 
     * @param file            File object
     * 
     * @return                <code>true</code> if file exist and has valid extension,
     * <code>false</code> otherwise
     */
    public boolean canHandle(File file);

    /**
     * Return streamable file reference. For FLV files returned streamable file already has
     * generated metadata injected.
     * 
     * @param file             File resource
     * 
     * @return                 Streamable file resource
     * 
     * @throws IOException     Thrown if there were problems accessing given file
     */
    public IStreamableFile getStreamableFile(File file) throws IOException;

}
