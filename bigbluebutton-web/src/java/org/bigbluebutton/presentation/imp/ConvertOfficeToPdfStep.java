package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.bigbluebutton.presentation.PageConverter;

import static org.bigbluebutton.presentation.FileTypeConstants.*;

@SuppressWarnings("serial")
public class ConvertOfficeToPdfStep {
	
	private static final List<String> SUPPORTED_FILE_LIST = new ArrayList<String>(11) {		
		{				
		   // Add all the supported files				
		   add(XLS); add(XLSX);	add(DOC); add(DOCX); add(PPT); add(PPTX);				
		   add(ODT); add(RTF); add(TXT); add(ODS); add(ODP);			
		}
	};
		
	public boolean prepareFileType(String conference, String room, String presentationName, File presentationFile, String ext) {
		if (SUPPORTED_FILE_LIST.contains(ext)) {
				PageConverter converter = new Office2PdfPageConverter();
				File output = new File(presentationFile.getAbsolutePath().substring(0, presentationFile.getAbsolutePath().lastIndexOf(".")) + ".pdf");
				boolean success = converter.convert(presentationFile, output, 0);
				
				return success;
		}
		return false;
	}
}
