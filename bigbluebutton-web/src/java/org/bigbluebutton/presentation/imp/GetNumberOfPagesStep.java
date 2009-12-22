package org.bigbluebutton.presentation.imp;

import static org.bigbluebutton.presentation.FileTypeConstants.*;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings("serial")
public class GetNumberOfPagesStep {
	
	private String swfToolsDir;
	private int maxNumPages = 100;
	
	private static final List<String> MULTI_PAGE_DOCS_LIST = new ArrayList<String>(12) {		
		{				
		   // Add all the supported files				
		   add(XLS); add(XLSX);	add(DOC); add(DOCX); add(PPT); add(PPTX);				
		   add(ODT); add(RTF); add(TXT); add(ODS); add(ODP); add(PDF);
		}
	};
	
	private static final List<String> SINGLE_PAGE_DOCS_LIST = new ArrayList<String>(3) {		
		{				
			add(JPG); add(JPEG); add(PNG);
		}
	};
	
	public int getnumPages(String conference, String room, String presentationName, File presentationFile, String ext) {
		int numPages = 0;
		
		if (MULTI_PAGE_DOCS_LIST.contains(ext)) {
			Pdf2SwfPageCounter pageCounter = new Pdf2SwfPageCounter();
			pageCounter.setSwfToolsDir(swfToolsDir);
			numPages = pageCounter.countNumberOfPages(presentationFile);
			
			if (numPages > maxNumPages) {
				return (0);
			} else if (numPages > 0)
					return (numPages);
		} else if (SINGLE_PAGE_DOCS_LIST.contains(ext)) {
			numPages = 1;
		}
		return (0);
	}

	public void setSwfToolsDir(String swfToolsDir) {
		this.swfToolsDir = swfToolsDir;
	}
	
	public void setMaxNumPages(int maxPages) {
		maxNumPages = maxPages;
	}
}
