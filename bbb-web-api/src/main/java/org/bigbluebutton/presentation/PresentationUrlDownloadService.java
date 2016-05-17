package org.bigbluebutton.presentation;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Timer;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpException;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PresentationUrlDownloadService {
	private static Logger log = LoggerFactory.getLogger(PresentationUrlDownloadService.class);
	
	private final int maxRedirects = 5;
	private DocumentConversionService documentConversionService;
	private String presentationBaseURL;
	private String presentationDir;
	
  public void processUploadedPresentation(UploadedPresentation uploadedPres) {
    documentConversionService.processDocument(uploadedPres);
  }
  
  public void processUploadedFile(String meetingId, String presId, String filename, File presFile) {
    UploadedPresentation uploadedPres = new UploadedPresentation(meetingId, presId, filename, presentationBaseURL);
    uploadedPres.setUploadedFile(presFile);
    processUploadedPresentation(uploadedPres);
  }
  
	public void downloadAndProcessDocument(String address, String meetingId) {
	    log.debug("downloadAndProcessDocument [pres=" + address + ", meeting=" + meetingId + "]");
	    
	    String presFilename = address.substring(address.lastIndexOf('/') + 1);
	    log.debug("downloadAndProcessDocument [filename=" + presFilename + "]");
	    String filenameExt = getFilenameExt(presFilename);

	    String presId = generatePresentationId(presFilename);
	    File uploadDir = createPresentationDirectory(meetingId, presentationDir, presId);
	    if (uploadDir != null) {
	      String newFilename = createNewFilename(presId, filenameExt);
	      String newFilePath = uploadDir.getAbsolutePath() + File.separatorChar + newFilename;
	        
	      if (savePresentation(meetingId, newFilePath, address)) {
	        File pres = new File(newFilePath);
	        processUploadedFile(meetingId, presId, presFilename, pres);
	      } else {
	        log.error("Failed to download presentation=[" + address + "], meeting=[" + meetingId + "]");
	      }
	    } 
	  }
	 
	public String generatePresentationId(String name) {
		long timestamp = System.currentTimeMillis();		
		return DigestUtils.shaHex(name) + "-" + timestamp;
	}
	
	public String getFilenameExt(String filename) {
		return filename.substring(filename.lastIndexOf("."));
	}
	
	public String createNewFilename(String presId, String fileExt) {
		return presId + fileExt;
	}
	
	public File createPresentationDirectory(String meetingId, String presentationDir, String presentationId) {
		String meetingPath = presentationDir + File.separatorChar + meetingId + File.separatorChar + meetingId;
		String presPath = meetingPath + File.separatorChar + presentationId;
		File dir = new File(presPath);
		log.debug("Creating dir [{}]", presPath);
		if (dir.mkdirs()) {
			return dir;
		}
		return null;
	}
	
	private String followRedirect(String meetingId, String redirectUrl, 
			int redirectCount, String origUrl) {

		if (redirectCount > maxRedirects) {
			log.error("Max redirect reached for meeting=[{}] with url=[{}]", meetingId, origUrl);
			return null;
		}
		
		URL presUrl;
		try {
     	presUrl = new URL(redirectUrl);
    } catch (MalformedURLException e) {
    	log.error("Malformed url=[{}] for meeting=[{}]", redirectUrl, meetingId);
	    return null;
    }			

		HttpURLConnection conn;
    try {
	    conn = (HttpURLConnection) presUrl.openConnection();
			conn.setReadTimeout(5000);
			conn.addRequestProperty("Accept-Language", "en-US,en;q=0.8");
			conn.addRequestProperty("User-Agent", "Mozilla");
			 
			// normally, 3xx is redirect
			int status = conn.getResponseCode();
			if (status != HttpURLConnection.HTTP_OK) {
				if (status == HttpURLConnection.HTTP_MOVED_TEMP
					|| status == HttpURLConnection.HTTP_MOVED_PERM
					|| status == HttpURLConnection.HTTP_SEE_OTHER) {
					String newUrl = conn.getHeaderField("Location");
					return followRedirect(meetingId, newUrl, redirectCount + 1, origUrl);
				} else {
					log.error("Invalid HTTP response=[{}] for url=[{}] with meeting[{}]", status, redirectUrl, meetingId);
					return null;
				}					
			} else {
				return redirectUrl;
			}			
    } catch (IOException e) {
    	log.error("IOException for url=[{}] with meeting[{}]", redirectUrl, meetingId);
	    return null;
    }
	}
	
	public boolean savePresentation(final String meetingId, final String filename, 
			final String urlString) {
		
		String finalUrl = followRedirect(meetingId, urlString, 0, urlString);
		
		if (finalUrl == null) return false;
		
		boolean success = false;
		GetMethod method = new GetMethod(finalUrl);
		HttpClient client = new HttpClient();
		try {
		    int statusCode = client.executeMethod(method);
		    if (statusCode == HttpStatus.SC_OK) {     
		    	FileUtils.copyInputStreamToFile(
		        method.getResponseBodyAsStream(), new File(filename));
		    	log.info("Downloaded presentation at [{}]", finalUrl);
		    	success = true;
		    }
		} catch (HttpException e) {
			log.error("HttpException while downloading presentation at [{}]", finalUrl);
		} catch (IOException e) {
			log.error("IOException while downloading presentation at [{}]", finalUrl);
		} finally {
			method.releaseConnection();
		}
		
		return success;
	}
	
	public void setPresentationDir(String presDir) {
	  presentationDir = presDir;
	}
	
	public void setPresentationBaseURL(String presentationBaseUrl) {
	  presentationBaseURL = presentationBaseUrl;
	}
	
	public void setDocumentConversionService(DocumentConversionService documentConversionService) {
	  this.documentConversionService = documentConversionService;
	}
	
	
}
