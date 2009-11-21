/*
 * BigBlueButton - http://www.bigbluebutton.org
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
 * $Id: $
 */
package org.bigbluebutton.presentation

import com.artofsolving.jodconverter.*
import com.artofsolving.jodconverter.openoffice.connection.*
import com.artofsolving.jodconverter.openoffice.converter.*

public class Office2PdfPageConverter implements PageConverter{

	public boolean convert(File presentationFile, File output, int page){
		def now = new Date()
		println "Office2PDF starting $now"
		
		def connection = new SocketOpenOfficeConnection(8100)

		try
		{
			connection.connect()
		
			def registry = new DefaultDocumentFormatRegistry()
			def converter = new OpenOfficeDocumentConverter(connection, registry)

			def pdf = registry.getFormatByFileExtension("pdf")
			def pdfOptions = [ 'ReduceImageResolution': true, 'MaxImageResolution': 300 ]
			pdf.setExportOption(DocumentFamily.TEXT, "FilterData", pdfOptions)

			converter.convert(presentationFile, output, pdf)

			connection.disconnect()
			
			now = new Date()
			println "OFFICE2PDF ended $now"
			return true
		}
		catch(Exception e)
		{
			e.printStackTrace();
			return false
		}
	}
}
