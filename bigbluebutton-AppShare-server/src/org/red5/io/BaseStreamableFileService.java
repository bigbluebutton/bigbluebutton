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
 * Base class for streamable file services.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public abstract class BaseStreamableFileService implements
		IStreamableFileService {

	/** {@inheritDoc} */
    public abstract String getPrefix();

	/** {@inheritDoc} */
    public abstract String getExtension();

	/** {@inheritDoc} */
    public String prepareFilename(String name) {
		if (name.startsWith(getPrefix() + ':')) {
			name = name.substring(getPrefix().length() + 1);
			if (!name.endsWith(getExtension())) {
				name = name + getExtension();
			}
		}

		return name;
	}

	/** {@inheritDoc} */
    public boolean canHandle(File file) {
		return file.exists()
				&& file.getAbsolutePath().toLowerCase()
						.endsWith(getExtension());
	}

	/** {@inheritDoc} */
    public abstract IStreamableFile getStreamableFile(File file)
			throws IOException;

}
