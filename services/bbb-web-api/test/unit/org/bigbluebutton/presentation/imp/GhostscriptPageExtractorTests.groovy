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

import org.bigbluebutton.presentation.Util

class GhostscriptPageExtractorTests extends GroovyTestCase {

	def pageExtractor
	def GS_EXEC = '/usr/bin/gs'
	static final String PRESENTATIONDIR = '/tmp/var/bigbluebutton'
	def noPdfMarkWorkaround = "/etc/bigbluebutton/nopdfmark.ps"
	
	def conf = "test-conf"
	def rm = "test-room"
	def presName = "thumbs"	
	def presDir
		
	void setUp() {
		println "Test setup"
		pageExtractor = new GhostscriptPageExtractor()		
		pageExtractor.setGhostscriptExec(GS_EXEC)	
		pageExtractor.setNoPdfMarkWorkaround(noPdfMarkWorkaround)
		
		presDir = new File("$PRESENTATIONDIR/$conf/$rm/$presName")
		if (presDir.exists()) Util.deleteDirectory(presDir)
		
		presDir.mkdirs()
	}
	
    void testExtractPage() {
		def uploadedFilename = 'SeveralBigPagesPresentation.pdf'		
		def uploadedFile = new File("test/resources/$uploadedFilename")
			
		def uploadedPresentation = new File(presDir.absolutePath + "/$uploadedFilename")
		int copied = FileCopyUtils.copy(uploadedFile, uploadedPresentation) 
		assertTrue(uploadedPresentation.exists())
		
		def tempDir = new File(uploadedPresentation.parent + File.separatorChar + "temp")
		tempDir.mkdir()
		
		int page = 1
		File outFile = new File(tempDir.absolutePath + File.separator + "temp-${page}.pdf")
		
		boolean success = pageExtractor.extractPage(uploadedPresentation, outFile, page)
		assertTrue success
		
		page = 3
		outFile = new File(tempDir.absolutePath + File.separator + "temp-${page}.pdf")
		success = pageExtractor.extractPage(uploadedPresentation, outFile, page)
		assertTrue success
    }
    
}
