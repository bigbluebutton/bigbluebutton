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

package org.bigbluebutton.fileupload.document.impl;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.FilenameFilter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.bigbluebutton.fileupload.ISlideDatabase;
import org.bigbluebutton.fileupload.SlideDescriptor;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.multipart.MultipartFile;


/**
 * This class is used as the BASE class where client services requests are routed. Service requests: fileUpload, getting Slides for viewing....
 * The requests are received by FileUploadCintroller class and routed here.
 * 
 * Some code from jGallery
 * 
 * @author ritzalam
 */
public class FileSystemSlideManager implements ISlideDatabase {
	
	/** The logger. */
	private final Log logger = LogFactory.getLog(getClass());
	// destination directory of the slides
	/** The base directory. */
	private String baseDirectory = null;
	
	/** The extracted folder. */
	private String extractedFolder = null;
	
	/** The output xml. */
	private PrintWriter outputXML = null;
	// used for generating slides XML 
	/** The Constant HEADER. */
	private static final String HEADER = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	
	/** The Constant PRESENTATIONS. */
	private static final String PRESENTATIONS = "<presentations>";
	
	/** The Constant PRESENTATIONS_END_TAG. */
	private static final String PRESENTATIONS_END_TAG = "</presentations>";
	
	/** The Constant PRESENTATION. */
	private static final String PRESENTATION = "<presentation id=\"slides\">";
	
	/** The Constant PRESENTATION_END_TAG. */
	private static final String PRESENTATION_END_TAG = "</presentation>";
	
	/** The Constant DESCRIPTION. */
	private static final String DESCRIPTION = "<description>";
	
	/** The Constant DESCRIPTION_END_TAG. */
	private static final String DESCRIPTION_END_TAG = "</description>";
	
	/** The Constant SLIDE. */
	private static final String SLIDE = "<slide>";
	
	/** The Constant SLIDE_END_TAG. */
	private static final String SLIDE_END_TAG = "</slide>";
	
	/** The Constant NAME. */
	private static final String NAME = "<name>";
	
	/** The Constant NAME_END_TAG. */
	private static final String NAME_END_TAG = "</name>";
	
	/** The Constant SOURCE. */
	private static final String SOURCE = "<source>";
	
	/** The Constant SOURCE_END_TAG. */
	private static final String SOURCE_END_TAG = "</source>";
	
	/** The Constant HOST. */
	private static final String HOST = "<host>";
	
	/** The Constant HOST_END_TAG. */
	private static final String HOST_END_TAG = "</host>";
	
	/** The Constant ROOM. */
	private static final String ROOM = "<room>";
	
	/** The Constant ROOM_END_TAG. */
	private static final String ROOM_END_TAG = "</room>";
	
	/** The Constant host. */
	private static final String host = "http://localhost:8080";
	
	/**
	 * Setter for destination directory.
	 * 
	 * @param dest destination directory
	 */
	public void setBaseDirectory(String dest) {
		this.baseDirectory = dest;
	}
	
	/**
	 * Setter for extracted folder directory.
	 * 
	 * @param extractedFolder the extracted folder
	 */
	public void setExtractedFolder(String extractedFolder) {
		this.extractedFolder = extractedFolder;
	}
	
	/**
	 * This method create thumbImage of the image file given and save it in outFile.
	 * Compression quality is also given. thumbBounds is used for calculating the size of the thumb.
	 * 
	 * @param infile slide image to create thumb
	 * @param outfile output thumb file
	 * @param compressionQuality the compression quality
	 * @param thumbBounds the thumb bounds
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 */
	public void resizeImage(File infile, File outfile, float compressionQuality,
			int thumbBounds) throws IOException
	{
		// Retrieve jpg image to be resized
		Image image = ImageIO.read(infile);
		
		// get original image size for thumb size calculation
		int imageWidth = image.getWidth(null);
		int imageHeight = image.getHeight(null);

		float thumbRatio = (float) thumbBounds / Math.max(imageWidth, imageHeight);

		int thumbWidth = (int) (imageWidth * thumbRatio);
		int thumbHeight = (int) (imageHeight * thumbRatio);

		// draw original image to thumbnail image object and
		// scale it to the new size on-the-fly
		BufferedImage thumbImage = new BufferedImage(thumbWidth, thumbHeight,
			BufferedImage.TYPE_INT_RGB);
		Graphics2D graphics2D = thumbImage.createGraphics();
		graphics2D.setRenderingHint(RenderingHints.KEY_INTERPOLATION,
			RenderingHints.VALUE_INTERPOLATION_BICUBIC);
		graphics2D.drawImage(image, 0, 0, thumbWidth, thumbHeight, null);

		// Find a jpeg writer
		ImageWriter writer = null;
		Iterator<ImageWriter> iter = ImageIO.getImageWritersByFormatName("jpg");
		if (iter.hasNext())
		{
			writer = (ImageWriter) iter.next();
		}
		
		ImageWriteParam iwp = writer.getDefaultWriteParam();
		iwp.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
		iwp.setCompressionQuality(compressionQuality);

		// Prepare output file
		ImageOutputStream ios = ImageIO.createImageOutputStream(outfile);
		writer.setOutput(ios);
		// write to the thumb image 
		writer.write(thumbImage);

		// Cleanup
		ios.flush();
		writer.dispose();
		ios.close();
	}
	
	/**
	 * This method is used to generate SlideDescriptor List slide thumbs of the given conference room.
	 * 
	 * @param room conference room ID
	 * 
	 * @return List of Slide (thumb) Descriptors of all the slides of the conference room
	 */
	public List<SlideDescriptor> getThumbnailsForRoom(Integer room) {
		logger.info("getting thumbnails for = [" + room + "]");
		// pointing to extracted folder directory
		File file = new File(baseDirectory + File.separator + room + File.separator + extractedFolder);
		
		// get all the files in the folder
		File[] files = file.listFiles();
			
		ArrayList<SlideDescriptor> listOfFiles = new ArrayList<SlideDescriptor>();
		// run through the File array
		for (int i = 0; i < files.length; i++) {
			if (!files [i].isDirectory()) {
				String filename = (String)files[i].getName();
				// get only the files that ends with ".jpg" and starts with "thumb-" in the directory
				if ((filename.endsWith(".jpg")) && (filename.startsWith("thumb-"))) {
					logger.info("getting slide = [" + filename + "]");
					SlideDescriptor slide = new SlideDescriptor(filename, room);
					listOfFiles.add(slide);
				}					
			}
		}
		
        Collections.sort(listOfFiles, new SlideComparator());
				
		return listOfFiles;
	}	
	
	/**
	 * This method returns the ArrayList of slideDescriptors that belongs to the given conference room.
	 * 
	 * @param room conference room ID
	 * 
	 * @return List of SlideDescriptor
	 */
	public List<SlideDescriptor> getSlidesForRoom(Integer room) {
		logger.info("getting slides for = [" + room + "]");
		// pointing to extracted folder directory
		File file = new File(baseDirectory + File.separator + room + File.separator + extractedFolder);
		// get all the files in the folder
		File[] files = file.listFiles();
			
		ArrayList<SlideDescriptor> listOfFiles = new ArrayList<SlideDescriptor>();
		
		for (int i = 0; i < files.length; i++) {
			if (!files [i].isDirectory()) {
				String filename = (String)files[i].getName();
				// get only the files that end with ".jpg" and not start with "thumb-" in the directory
				if ((filename.endsWith(".swf")) && (! filename.startsWith("thumb-"))){
					logger.info("getting slide = [" + filename + "]");
					SlideDescriptor slide = new SlideDescriptor(filename, room);
					listOfFiles.add(slide);
				}					
			}
		}

        Collections.sort(listOfFiles, new SlideComparator());
        
		return listOfFiles;
	}
	
	/**
	 * This method loads the slide .swf files from the source folder and puts it in an ArratList and returns it.
	 * 
	 * @param sourceFolder directory of the source
	 * 
	 * @return ArrayList of slides
	 */
	public ArrayList<File> getExtractedSlides(String sourceFolder) {
		logger.info("Slide folder = " + sourceFolder);
		// pointing to extracted folder directory
		File file = new File(sourceFolder);
		// get all the files in the folder
		File[] files = file.listFiles();
		// ArrayList to hold slide swf files
		ArrayList<File> listOfFiles = new ArrayList<File>();
		
		for (int i= 0; i < files.length; i++) {
			if (!files [i].isDirectory()) {
				String filename = (String)files[i].getName();
				// get only the files that end with ".swf" and not start with "thumb-" in the directory
				if ((filename.toLowerCase().endsWith(".swf")) &&
						!(filename.toLowerCase().startsWith("thumb"))) {
					listOfFiles.add(files[i]);	
				}
			}
		}
		
		return listOfFiles;
	}

	
	/**
	 * This method saves the MultipartFile given as parameter( temporary stored file format)
	 * And it also return instance of file which is saved in saveDir.
	 * 
	 * @param multipartFile temporary storage of uploaded file
	 * @param room conference room ID
	 * 
	 * @return file pointing to the new file stored
	 * 
	 * @throws IOException Signals that an I/O exception has occurred.
	 * 
	 * @see MultipartFile API
	 */
	public File saveUploadedFile(MultipartFile multipartFile, Integer room) throws IOException {
		String filename = multipartFile.getOriginalFilename().replace(' ', '_');
		
		File saveDir = new File(baseDirectory + File.separator + room);

        if (!saveDir.exists()) {
        	saveDir.mkdirs();
        }			
		
		File file = new File(saveDir.getAbsolutePath() + File.separator + filename);
		// store multipartFile in permanent storage
		multipartFile.transferTo(file);
		
		return file;
	}

	
	/**
	 * This method copies the contents of the file (in our case, slides) to the OutputStream given.
	 * OutputStream given to this method (as parameter) is the connection stream to the client.
	 * This tells us that this function streams the slides to the client.
	 * 
	 * @param room conference room ID
	 * @param name name of the slide
	 * @param os the os
	 * 
	 * @see FileCopyUtils API
	 */
	public void streamImage(Integer room, String name, OutputStream os) {
		
		File file = new File(baseDirectory + File.separator + room 
				+ File.separator + extractedFolder + File.separator + name);
		
		InputStream is = null;
		
		try {
			is = new FileInputStream(file);
		} catch (FileNotFoundException e) {
			logger.error("File not found. \n " + e.getMessage());
		}
		
		try {
			if (is != null) {
				// streaming the contents(slide) in is to os which points to client connection
				FileCopyUtils.copy(is, os);
			}	
		} catch (IOException e) {
			logger.error("Error reading file.\n" + e.getMessage());
		}
	}
	
	/**
	 * This method basically copies the contents of the file (in our case, slide XML description) to the OutputStream given.
	 * OutputStream given to method (as parameter) is the connection stream to the client.
	 * This tells us that this function streams the slides to the client.
	 * 
	 * @param room conference room ID
	 * @param name name of the slide
	 * @param os the os
	 * 
	 * @see FileCopyUtils API
	 */
	public void getXml(Integer room, String name, OutputStream os) {
		File file = new File(baseDirectory + File.separator + room 
				+ File.separator + name);
		
		InputStream is = null;
		
		try {
			is = new FileInputStream(file);
		} catch (FileNotFoundException e) {
			logger.error("File not found. \n " + e.getMessage());
		}
		
		try {
			if (is != null) {
				// streaming the contents (slide XML) in is to os which points to client connection
				FileCopyUtils.copy(is, os);
			}	
		} catch (IOException e) {
			logger.error("Error reading file.\n" + e.getMessage());
		}
	}

	/**
	 * This method creates XML formatted string (default slide description of the conference room) that is ready to be sent to the client.
	 * 
	 * @param room conference room ID
	 * 
	 * @see createXml()
	 */
	public void createDefaultXml(Integer room) {		
		String slidesXml = HEADER + "\n";
		slidesXml += PRESENTATIONS + "\n" + "\t" + PRESENTATION + "\n";
		slidesXml += "\t\t" + DESCRIPTION;
		
		String description = "Presentation Slides";
		slidesXml += description + DESCRIPTION_END_TAG + "\n";	
		slidesXml += PRESENTATION_END_TAG + PRESENTATIONS_END_TAG;
		
		try {
			outputXML = new PrintWriter(new FileWriter(baseDirectory + File.separator + room 
					+ File.separator  + "slides.xml"));
			outputXML.print(slidesXml);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		finally {
			if (outputXML != null){
				outputXML.close();
			}
		}		
	}
	
	/**
	 * Gets the slides in xml.
	 * 
	 * @param room the room
	 * 
	 * @return the slides in xml
	 * 
	 * @see createXml()
	 */
	public String getSlidesInXml(Integer room) {
		return 	createXml(room);
	}
	
	/**
	 * This method creates XML formatted string (slide description of the conference room) that is ready to be sent to the client.
	 * 
	 * @param room conference room ID
	 * 
	 * @return slide description XML string
	 */
	public String createXml(Integer room) {
		List<SlideDescriptor> slides = getSlidesForRoom(room);
		
		String slidesXml = HEADER + "\n";
		slidesXml += PRESENTATIONS + "\n" + "\t" + PRESENTATION + "\n";
		slidesXml += "\t\t" + DESCRIPTION;
		
		String description = "Presentation Slides";
		slidesXml += description + DESCRIPTION_END_TAG + "\n";
		slidesXml += HOST + host + HOST_END_TAG + "\n";
		slidesXml += ROOM + room + ROOM_END_TAG + "\n";
		
		logger.info("slidesXml = " + slidesXml);
		
		for (Iterator it = slides.iterator(); it.hasNext();) {
			slidesXml += SLIDE + NAME;
			SlideDescriptor slide = (SlideDescriptor) it.next();
			slidesXml += slide.getName() + NAME_END_TAG;
			slidesXml += SLIDE_END_TAG + "\n";			
		}
		
		slidesXml += PRESENTATION_END_TAG + PRESENTATIONS_END_TAG;
		
		try {
			outputXML = new PrintWriter(new FileWriter(baseDirectory + File.separator + room 
					+ File.separator  + "slides.xml"));
			outputXML.print(slidesXml);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		finally {
			if (outputXML != null){
				outputXML.close();
			}
		}	
		
		return slidesXml;
	}
	
	/**
	 * TODO Auto-generated method stub.
	 */
	public void clearDatabase() {
		// TODO Auto-generated method stub
		
	}
	
	/**
	 * Getter for destination directory.
	 * 
	 * @return dest destination directory
	 */
	public String getBaseDirectory() {
		return baseDirectory;
	}
	
	/**
	 * Getter for extracted folder directory.
	 * 
	 * @return extractedFolder
	 */
	public String getExtractedFolder() {
		return extractedFolder;
	}

    /**
     * Internal class used to compare two slides and check for differences.
     */
    private class SlideComparator implements Comparator {
        
        /**
         * Method to perform the actual comparison and sorting of files
         * This would be called automatically when this comparator is used
         * by a Collections.sort call
         * 
         * @param a1 first file to compare
         * @param a2 second file to compare
         * 
         * @return 0 if the files are equal, 1 if a1 is above a2, -1 if a2 is above a1
         */
        public int compare(Object a1, Object a2) {
        	SlideDescriptor file1 = null;
        	SlideDescriptor file2 = null;
            if (a1 instanceof SlideDescriptor) {
                file1 = (SlideDescriptor) a1;
            }
            if (a2 instanceof SlideDescriptor) {
                file2 = (SlideDescriptor) a2;
            }

            int number1 = 0;
            int number2 = 0;
            if (file1 != null) {
                number1 = getNumberFromFile(file1.getName());
            }
            if (file2 != null) {
                number2 = getNumberFromFile(file2.getName());
            }

            if (number1 > number2) return 1;
            else if (number1 < number2) return -1;

            return 0;
        }

        /**
         * Wrapper method to safely determine if the passed object equals this.
         * 
         * @param obj to check
         * 
         * @return true if the objects are equal
         */
        public boolean equals(Object obj) {
            return obj != null && this.equals(obj);
        }

        /**
         * Convience method to get numbers from a filename, in the hope of
         * ordering the files properly
         * For example, a file named Slide2.jpg would extract as 2, and therefore
         * could be sorted about 3, etc.
         * 
         * @param name of the file
         * 
         * @return numbers in the file, or -1 on error / no numbers present
         */
        private int getNumberFromFile(String name) {
            try {
                String toReturn = "";
                char current;
                int lastDash = name.lastIndexOf('-');
                for (int i = lastDash; i < name.length(); i++) {
                    current = name.charAt(i);
                    if (Character.isDigit(current)) {
                        toReturn += current;
                    }
                    if (current == '.') {
                        break;
                    }
                }
                return Integer.parseInt(toReturn);
            } catch (Exception failed) {
                return -1;
            }
        }
	}	
}
