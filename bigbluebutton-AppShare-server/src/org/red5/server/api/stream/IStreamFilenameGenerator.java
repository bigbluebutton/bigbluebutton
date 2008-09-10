package org.red5.server.api.stream;

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

import org.red5.server.api.IScope;
import org.red5.server.api.IScopeService;

// TODO: Auto-generated Javadoc
/**
 * A class that can generate filenames for streams.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (bauch@struktur.de)
 */
public interface IStreamFilenameGenerator extends IScopeService {

	/** Name of the bean to setup a custom filename generator in an application. */
	public static String BEAN_NAME = "streamFilenameGenerator";

	/**
	 * Possible filename generation types.
	 */
	public static enum GenerationType {
			
			/** The PLAYBACK. */
			PLAYBACK,
			
			/** The RECORD. */
			RECORD
	};
	
	/**
	 * Generate a filename without an extension.
	 * 
	 * @param scope           Scope to use
	 * @param name            Stream name
	 * @param type            Generation strategy (either playback or record)
	 * 
	 * @return                Full filename
	 */
	public String generateFilename(IScope scope, String name, GenerationType type);

	/**
	 * Generate a filename with an extension.
	 * 
	 * @param scope           Scope to use
	 * @param name            Stream filename
	 * @param extension       Extension
	 * @param type            Generation strategy (either playback or record)
	 * 
	 * @return                Full filename with extension
	 */
	public String generateFilename(IScope scope, String name, String extension, GenerationType type);

	/**
	 * True if returned filename is an absolute path, else relative to application.
	 * 
	 * If relative to application, you need to use
	 * <code>scope.getContext().getResources(fileName)[0].getFile()</code> to resolve
	 * this to a file.
	 * 
	 * If absolute (ie returns true) simply use <code>new File(generateFilename(scope, name))</code>
	 * 
	 * @return true, if resolves to absolute path
	 */
    public boolean resolvesToAbsolutePath();
	
}
