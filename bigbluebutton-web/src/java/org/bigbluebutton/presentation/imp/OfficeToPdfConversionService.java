/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 * 		   DJP <DJP@architectes.org>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.presentation.imp;

import java.io.*;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.mozilla.universalchardet.UniversalDetector;
import static org.bigbluebutton.presentation.FileTypeConstants.*;

public class OfficeToPdfConversionService {
	private static Logger log = LoggerFactory.getLogger(OfficeToPdfConversionService.class);	
	
	/*
	 * Convert the Office document to PDF. If successful, update 
	 * UploadPresentation.uploadedFile with the new PDF out and
	 * UploadPresentation.lastStepSuccessful to TRUE.
	 */
	public UploadedPresentation convertOfficeToPdf(UploadedPresentation pres) {
		initialize(pres);
		if (SupportedFileTypes.isOfficeFile(pres.getFileType())) {
		    if( pres.getFileType().toLowerCase().equals(TXT) ){
			    convertTxtToUtf8(pres);
			}
			File pdfOutput = setupOutputPdfFile(pres);				
			if (convertOfficeDocToPdf(pres, pdfOutput)) {
				log.info("Successfully converted office file to pdf.");
				makePdfTheUploadedFileAndSetStepAsSuccess(pres, pdfOutput);
			} else {
				log.warn("Failed to convert " + pres.getUploadedFile().getAbsolutePath() + " to Pdf.");
			}
		}
		return pres;
	}
	
	public String GuessTxtEncoding(File fileName){
        byte[] buf = new byte[4096];
        
        UniversalDetector detector = new UniversalDetector(null);

		try{
			java.io.FileInputStream fis = new java.io.FileInputStream(fileName);
			int nread;
			while ((nread = fis.read(buf)) > 0 && !detector.isDone()) {
				detector.handleData(buf, 0, nread);
			}
            fis.close();			
		}catch(IOException e){
		    e.printStackTrace();
		}    
		
        detector.dataEnd();

        String encoding = detector.getDetectedCharset();
        if (encoding != null) {
            log.info("Detected encoding = " + encoding);
        } else {
		    encoding = "ASCII";
            log.info("No encoding detected. Use ASCII");
        }
		
        detector.reset();  
		
        return encoding;		
	}
	
	public void convertTxtToUtf8(UploadedPresentation pres) {	
		try{
		    log.info("convertTxtToUtf8");
		    File presentationFile = pres.getUploadedFile();
		    String encoding = GuessTxtEncoding(presentationFile);
			
		    FileInputStream fis = new FileInputStream(presentationFile);
		    InputStreamReader isr = new InputStreamReader(fis, encoding);
			Reader in = new BufferedReader(isr);
			
			File dir = presentationFile.getParentFile();
			File tmpfile = File.createTempFile("utf8",null,dir);
			log.info("create tempfile: " + tmpfile);
		    FileOutputStream fos = new FileOutputStream(tmpfile);
			Writer out = new OutputStreamWriter(fos, "UTF8");
			
			int ch;
			while ((ch = in.read()) > -1) {
                out.write((char)ch);
			}
			in.close();
			out.close();			
			fis.close();
			fos.close();
									
			boolean bSucc = presentationFile.delete();
			log.info("delete presentationFile: " + presentationFile);
			if( bSucc ){
			    log.info("delete orign file success");
			}else{
			    log.info("delete orign file failed");
			}
			
			bSucc = tmpfile.renameTo(presentationFile);
			log.info("rename " + tmpfile + " to " + presentationFile);
			if( bSucc ){
			    log.info("rename tmp success");
			}else{
			    log.info("rename tmp failed");
			}
			
		}catch(IOException e){
		    e.printStackTrace();
		}    
	}
	
	public void initialize(UploadedPresentation pres) {
		pres.setLastStepSuccessful(false);
	}
	
	private File setupOutputPdfFile(UploadedPresentation pres) {		
		File presentationFile = pres.getUploadedFile();
		String filenameWithoutExt = presentationFile.getAbsolutePath().substring(0, presentationFile.getAbsolutePath().lastIndexOf("."));
		return new File(filenameWithoutExt + ".pdf");
	}
	
	private boolean convertOfficeDocToPdf(UploadedPresentation pres, File pdfOutput) {
		PageConverter converter = new Office2PdfPageConverter();
		return converter.convert(pres.getUploadedFile(), pdfOutput, 0);
	}
	
	private void makePdfTheUploadedFileAndSetStepAsSuccess(UploadedPresentation pres, File pdf) {
		pres.setUploadedFile(pdf);
		pres.setLastStepSuccessful(true);
	}
}
