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

package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.presentation.PageConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.artofsolving.jodconverter.*;
import com.artofsolving.jodconverter.openoffice.connection.*;
import com.artofsolving.jodconverter.openoffice.converter.*;

public class Office2PdfPageConverter implements PageConverter {
	private static Logger log = LoggerFactory.getLogger(Office2PdfPageConverter.class);
	
	public boolean convert(File presentationFile, File output, int page){
		SocketOpenOfficeConnection connection = new SocketOpenOfficeConnection(8100);

		try {
			connection.connect();
			
			log.debug("Converting " + presentationFile.getAbsolutePath() + " to " + output.getAbsolutePath());
			
			DefaultDocumentFormatRegistry registry = new DefaultDocumentFormatRegistry();
			OpenOfficeDocumentConverter converter = new OpenOfficeDocumentConverter(connection, registry);

			DocumentFormat pdf = registry.getFormatByFileExtension("pdf");
			Map<String, Object> pdfOptions = new HashMap<String, Object>();
			pdfOptions.put("ReduceImageResolution", Boolean.TRUE);
			pdfOptions.put("MaxImageResolution", Integer.valueOf(300));
			pdf.setExportOption(DocumentFamily.TEXT, "FilterData", pdfOptions);
			
			converter.convert(presentationFile, output, pdf);
			connection.disconnect();
			
			if (output.exists()) {
				return true;
			} else {
				log.warn("Failed to convert: " + output.getAbsolutePath() + " does not exist.");
				return false;
			}
				
		} catch(Exception e) {
			log.error("Exception: Failed to convert " + output.getAbsolutePath());
			return false;
		}
	}

}
