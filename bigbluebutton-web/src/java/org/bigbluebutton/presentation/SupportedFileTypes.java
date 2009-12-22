package org.bigbluebutton.presentation;

import static org.bigbluebutton.presentation.FileTypeConstants.*;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("serial")
public final class SupportedFileTypes {
	private SupportedFileTypes() {} // Prevent instantiation
	
	private static final List<String> SUPPORTED_FILE_LIST = new ArrayList<String>(15) {		
		{				
		   // Add all the supported files				
		   add(XLS); add(XLSX);	add(DOC); add(DOCX); add(PPT); add(PPTX);				
		   add(ODT); add(RTF); add(TXT); add(ODS); add(ODP); add(PDF);
		   add(JPG); add(JPEG); add(PNG);
		}
	};
	
	public static boolean isFileSupported(String fileExtension) {
		return SUPPORTED_FILE_LIST.contains(fileExtension.toLowerCase());
	}
}
