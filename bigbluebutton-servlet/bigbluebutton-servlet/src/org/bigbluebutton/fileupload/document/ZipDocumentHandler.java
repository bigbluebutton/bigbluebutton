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

package org.bigbluebutton.fileupload.document;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


// TODO: Auto-generated Javadoc
/**
 * Methods of this class are used to extract uploaded slides in zip format. Zip files can only have following file formats: JPG, PNG or GIF.
 * Other formats in the zip file are ignored (not extracted).
 * 
 * @author ritzalam
 */
public class ZipDocumentHandler {
	
	// logging error when extracting (during exception)
    /** The log. */
	private static Log log = LogFactory.getLog(ZipDocumentHandler.class);
    
    
    /**
     * This method is called from convert(File fileInput, File destDir),
     * to write the contents of InputStream given to OutputStream given.
     * This is needed when extracting files from a zip file.
     * 
     * @param in the in
     * @param out OutputStream pointing to output file
     * 
     * @throws IOException Signals that an I/O exception has occurred.
     */
    private void copyInputStream(InputStream in, OutputStream out)
    throws IOException {
    	byte[] buffer = new byte[1024];
    	int len;
    	// copying contents from in to out
    	while ((len = in.read(buffer)) >= 0) {
    		out.write(buffer, 0, len);
    	}

    	in.close();
    	out.close();
    }

    /**
     * This method extracts the zip file given to the destDir. It uses ZipFile API
     * to parse through the files in the zip file.
     * Only files that the zip file can have are .jpg, .png and .gif formats.
     * 
     * @param fileInput pointing to the zip file
     * @param destDir directory where extracted files should go
     */
    public void convert(File fileInput, File destDir) {
    	try {
    		// Setup the ZipFile used to read entries
    		ZipFile zf = new ZipFile(fileInput.getAbsolutePath());
    		
            // Ensure the extraction directories exist
//            File directoryStructure = new File(destDir);
            if (!destDir.exists()) {
            	destDir.mkdirs();
            }
            
    		// Loop through all entries in the zip and extract as necessary
    		ZipEntry currentEntry;
    		for (Enumeration entries = zf.entries(); entries.hasMoreElements();) {
    			currentEntry = (ZipEntry) entries.nextElement();
    			
    			if (!currentEntry.isDirectory()) {
    				File fileEntry = new File(currentEntry.getName());
    				String fileName = fileEntry.getName().toLowerCase();
    				// Make sure to only deal with image files
    				if ((fileName.endsWith(".jpg")) ||
    					(fileName.endsWith(".png")) ||
    					(fileName.endsWith(".gif"))) {
    						// extracts the corresponding file in dest Directory
    						copyInputStream(zf.getInputStream(currentEntry),
    								new BufferedOutputStream(new FileOutputStream(destDir 
    										+ File.separator + fileEntry.getName())));
    					}
    			}
    		}
        } catch (Exception e) {
            if (log.isErrorEnabled()) {
                log.error("Could not load zip document for " +
                          fileInput.getName(), e);
            }
        }
    }
}
