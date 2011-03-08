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
package org.bigbluebutton.presentation.imp

//import org.springframework.util.FileCopyUtils
import org.bigbluebutton.presentation.Util

public class Office2PdfPageConverterTests extends GroovyTestCase {

	def converter
	static final String PRESENTATIONDIR = '/tmp/var/bigbluebutton'
	def conf = "test-conf"
	def rm = "test-room"
	def presName = "office"	
	def presDir
		
	void setUp() {
		println "Test setup"
		converter = new Office2PdfPageConverter()		
		
		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
	void testStrawPollPptDoc() {
		def uploadedFilename = '3-07_CPAC_Straw_Poll.ppt'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		def tempDir = new File(uploadedPresentation.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		File outFile = new File(tempDir.absolutePath + File.separator + "3-07_CPAC_Straw_Poll.pdf")
		
		boolean success = converter.convert(uploadedPresentation, outFile, 1 /*not-used*/)
		assertTrue success		
    }
	
	void testBarnRaisingPptDoc() {
		def uploadedFilename = 'Barn Raising Final.ppt'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		def tempDir = new File(uploadedPresentation.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		File outFile = new File(tempDir.absolutePath + File.separator + "Barn Raising Final.pdf")
		
		boolean success = converter.convert(uploadedPresentation, outFile, 1 /*not-used*/)
		assertTrue success		
    }
	
	void testFolbAphaPptDoc() {
		def uploadedFilename = 'folb_apha.ppt'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		def tempDir = new File(uploadedPresentation.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		File outFile = new File(tempDir.absolutePath + File.separator + "folb_apha.pdf")
		
		boolean success = converter.convert(uploadedPresentation, outFile, 1 /*not-used*/)
		assertTrue success		
    }
	
	void testEnergyAndClimateXlsDoc() {
		def uploadedFilename = 'Energy_and_Climate_Courses.xls'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		def tempDir = new File(uploadedPresentation.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		File outFile = new File(tempDir.absolutePath + File.separator + "Energy_and_Climate_Courses.pdf")
		
		boolean success = converter.convert(uploadedPresentation, outFile, 1 /*not-used*/)
		assertTrue success		
    }
}
