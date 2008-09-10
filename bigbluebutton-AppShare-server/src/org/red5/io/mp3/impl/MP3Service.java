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

import org.red5.io.BaseStreamableFileService;
import org.red5.io.IStreamableFile;
import org.red5.io.mp3.IMP3Service;

// TODO: Auto-generated Javadoc
/**
 * Streamable file service extension for MP3.
 */
public class MP3Service extends BaseStreamableFileService implements
		IMP3Service {

	/** {@inheritDoc} */
    @Override
	public String getPrefix() {
		return "mp3";
	}

	/** {@inheritDoc} */
    @Override
	public String getExtension() {
		return ".mp3";
	}

	/** {@inheritDoc} */
    @Override
	public IStreamableFile getStreamableFile(File file) throws IOException {
		return new MP3(file);
	}

}
