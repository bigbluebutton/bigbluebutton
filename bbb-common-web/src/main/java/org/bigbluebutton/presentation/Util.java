/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.presentation;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Path;

public final class Util {
	private static Logger log = LoggerFactory.getLogger(Util.class);

	public static void deleteDirectory(File directory) {
		/**
		 * Go through each directory and check if it's not empty.
		 * We need to delete files inside a directory before a
		 * directory can be deleted.
		**/
		File[] files = directory.listFiles();				
		for (File file : files) {
			if (file.isDirectory()) {
				deleteDirectory(file);
			} else {
				file.delete();
			}
		}
		// Now that the directory is empty. Delete it.
		directory.delete();	
	}


	public static void deleteDirectoryFromFileHandlingErrors(File presentationFile) {
		if ( presentationFile != null ){
			Path presDir = presentationFile.toPath().getParent();
			try {
				File presFileDir = new File(presDir.toString());
				if (presFileDir.exists()) {
					deleteDirectory(presFileDir);
				}
			} catch (Exception ex) {
				log.error("Error while trying to delete directory {}", presDir.toString(), ex);
			}
		}
	}

}
