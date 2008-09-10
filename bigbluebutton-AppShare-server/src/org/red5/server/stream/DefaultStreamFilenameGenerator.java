
package org.red5.server.stream;

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
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.stream.IStreamFilenameGenerator;

// TODO: Auto-generated Javadoc
/**
 * Default filename generator for streams. The files will be stored in a
 * directory "streams" in the application folder. Option for changing directory
 * streams are saved to is investigated as of 0.6RC1.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (bauch@struktur.de)
 */
public class DefaultStreamFilenameGenerator implements IStreamFilenameGenerator {

    /**
     * Generate stream directory based on relative scope path. The base directory is
     * <code>streams</code>, e.g. a scope <code>/application/one/two/</code> will
     * generate a directory <code>/streams/one/two/</code> inside the application.
     * 
     * @param scope            Scope
     * 
     * @return                 Directory based on relative scope path
     */
    private String getStreamDirectory(IScope scope) {
		final StringBuilder result = new StringBuilder();
		final IScope app = ScopeUtils.findApplication(scope);
		final String prefix = "streams/";
		while (scope != null && scope != app) {
			result.insert(0, scope.getName() + "/");
			scope = scope.getParent();
		}
		if (result.length() == 0) {
			return prefix;
		} else {
			result.insert(0, prefix).append("/");
			return result.toString();
		}
    }

	/** {@inheritDoc} */
    public String generateFilename(IScope scope, String name, GenerationType type) {
		return generateFilename(scope, name, null, type);
	}

	/** {@inheritDoc} */
    public String generateFilename(IScope scope, String name, String extension, GenerationType type) {
		String result = getStreamDirectory(scope) + name;
		if (extension != null && !extension.equals("")) {
			result += extension;
		}
		return result;
	}

    /**
     * The default filenames are relative to the scope path, so always return <code>false</code>.
     * 
     * @return always <code>false</code>
     */
	public boolean resolvesToAbsolutePath() {
		return false;
	}

}