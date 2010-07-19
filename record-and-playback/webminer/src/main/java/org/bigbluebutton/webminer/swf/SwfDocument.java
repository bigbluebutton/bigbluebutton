package org.bigbluebutton.webminer.swf;

import java.io.*;
import java.net.URL;
import java.util.Date;

import org.apache.lucene.document.*;

public class SwfDocument {

	static char dirSep = System.getProperty("file.separator").charAt(0);

	public static String uid(File f) {
		// Append path and date into a string in such a way that lexicographic
		// sorting gives the same results as a walk of the file hierarchy. Thus
		// null (\u0000) is used both to separate directory components and to
		// separate the path from the date.
		return f.getPath().replace(dirSep, '\u0000')
				+ "\u0000"
				+ DateTools.timeToString(f.lastModified(),
						DateTools.Resolution.SECOND);
	}

	public static String uid(URL url) {
		// Append path and date into a string in such a way that lexicographic
		// sorting gives the same results as a walk of the file hierarchy. Thus
		// null (\u0000) is used both to separate directory components and to
		// separate the path from the date.
		return url.toString() + System.currentTimeMillis();
				
	}
	public static String uid2url(String uid) {
		String url = uid.replace('\u0000', '/'); // replace nulls with
													// slashes
		return url.substring(0, url.lastIndexOf('/')); // remove date from end
	}

	public static Document Document(URL url, PresentationMeta meta)
	throws IOException, InterruptedException {
		// make a new, empty document
		Document doc = new Document();

		// Add the url as a field named "path". Use a field that is
		// indexed (i.e. searchable), but don't tokenize the field into words.
		doc.add(new Field("path", url.toString(),
				Field.Store.YES, Field.Index.NOT_ANALYZED));

		// Add the last modified date of the file a field named "modified".
		// Use a field that is indexed (i.e. searchable), but don't tokenize
		// the field into words.
		doc.add(new Field("modified", 
				(new Date(System.currentTimeMillis())).toString(),
				Field.Store.YES,
				Field.Index.NOT_ANALYZED));

		// Add the uid as a field, so that index can be incrementally
		// maintained.
		// This field is not stored with document, it is indexed, but it is not
		// tokenized prior to indexing.
		doc.add(new Field("uid", meta.getUid(), Field.Store.YES,
				Field.Index.NOT_ANALYZED));

		SwfParser parser = new SwfParser(url);

		parser.parse();

		// Add the tag-stripped contents as a Reader-valued Text field so it
		// will get tokenized and indexed.
		doc.add(new Field("contents", parser.getReader()));
		doc.add(new Field("title", parser.getContents(), Field.Store.YES,
				Field.Index.ANALYZED));

		// Add the summary as a field that is stored and returned with
		// hit documents for display.
		if (meta != null) {
			doc.add(new Field("summary", meta.getSummary(), Field.Store.YES,
					Field.Index.ANALYZED));
		}

		// Add the title as a field that it can be searched and that is stored.
		if (meta != null) {
			doc.add(new Field("fileName", meta.getFileName(), Field.Store.YES,
					Field.Index.ANALYZED));
		}
		
		// Add the slide play time as a field for future use of search result replay...
		if (meta != null){
			doc.add(new Field("slideTime", meta.getSlideTime(), Field.Store.YES,
					Field.Index.ANALYZED));
		}
		// return the document
		return doc;
	}
	
	/*
	public static Document Document(File f, PresentationMeta meta)
			throws IOException, InterruptedException {
		// make a new, empty document
		Document doc = new Document();

		// Add the url as a field named "path". Use a field that is
		// indexed (i.e. searchable), but don't tokenize the field into words.
		doc.add(new Field("path", f.getPath().replace(dirSep, '/'),
				Field.Store.YES, Field.Index.NOT_ANALYZED));

		// Add the last modified date of the file a field named "modified".
		// Use a field that is indexed (i.e. searchable), but don't tokenize
		// the field into words.
		doc.add(new Field("modified", DateTools.timeToString(f.lastModified(),
				DateTools.Resolution.MINUTE), Field.Store.YES,
				Field.Index.NOT_ANALYZED));

		// Add the uid as a field, so that index can be incrementally
		// maintained.
		// This field is not stored with document, it is indexed, but it is not
		// tokenized prior to indexing.
		doc.add(new Field("uid", uid(f), Field.Store.NO,
				Field.Index.NOT_ANALYZED));

		SwfParser parser = new SwfParser(swfExec, f.getAbsolutePath());
		
		parser.parse();

		// Add the tag-stripped contents as a Reader-valued Text field so it
		// will
		// get tokenized and indexed.
		doc.add(new Field("contents", parser.getReader()));

		// Add the summary as a field that is stored and returned with
		// hit documents for display.
		if (meta != null) {
		doc.add(new Field("summary", meta.getSummary(), Field.Store.YES,
				Field.Index.NO));
		}

		// Add the title as a field that it can be searched and that is stored.
		if (meta != null) {
		doc.add(new Field("title", meta.getTitle(), Field.Store.YES,
				Field.Index.ANALYZED));
		}
		// return the document
		return doc;
	}
	 */
}
