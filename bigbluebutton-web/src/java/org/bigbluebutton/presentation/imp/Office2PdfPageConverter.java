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
			e.printStackTrace();
			return false;
		}
	}

}
