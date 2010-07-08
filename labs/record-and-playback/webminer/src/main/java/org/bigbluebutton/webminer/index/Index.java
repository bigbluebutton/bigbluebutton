package org.bigbluebutton.webminer.index;
import org.apache.log4j.Logger;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.CorruptIndexException;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.Term;
import org.apache.lucene.index.TermEnum;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.apache.lucene.store.LockObtainFailedException;

import org.bigbluebutton.webminer.Constants;
import org.bigbluebutton.webminer.config.ConfigHandler;
import org.bigbluebutton.webminer.swf.PresentationMeta;
import org.bigbluebutton.webminer.swf.SwfDocument;
import org.bigbluebutton.webminer.web.controller.CourseIndexingController;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Date;
import java.util.Map;

import javax.xml.parsers.*;

public class Index {
	
	private static IndexWriter writer;		  // new index being built
	private static IndexReader reader;
	private static Index indexer; // singleton
	private static Logger logger = Logger.getLogger(Index.class);
			
	public static Index getInstance() {
		if (indexer == null) {
			indexer = new Index();
		}
		return indexer;
	}
	
	public void startIndex(String uid) {
		
		try {
			IndexReader.unlock(FSDirectory.getDirectory(ConfigHandler.indexPath));
			if (logger.isInfoEnabled()){
		    	  logger.info("index file path " + ConfigHandler.indexPath);
		      }
			reader = IndexReader.open(ConfigHandler.indexPath);
			
			TermEnum uidIter = reader.terms(new Term("uid"));
			while (uidIter.term()!= null) { 
				if (uid.equalsIgnoreCase(uidIter.term().text())) {
					reader.deleteDocuments(uidIter.term());
				}
		        uidIter.next();
			}
			reader.close();
		} catch (CorruptIndexException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (LockObtainFailedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			writer = new IndexWriter(ConfigHandler.indexPath, new StandardAnalyzer(), 
			        new IndexWriter.MaxFieldLength(1000000));
		} catch (CorruptIndexException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (LockObtainFailedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}
	
	public void addIndex (String presentationArch, Map attrs) throws Exception {
				
		
			
		  URL root = new URL(presentationArch);
	      Date start = new Date();

	      PresentationMeta meta = new PresentationMeta();
	      meta.setSummary((String) attrs.get("summary"));
	      meta.setFileName((String) attrs.get("fileName"));
	      meta.setUid((String) attrs.get("uid"));
	      //If the slide has never been played, in search result, user should only see the static swf file, no replay
	      if (attrs.get("slideTime")!=null){
	    	  meta.setSlideTime((String) attrs.get("slideTime"));
	      }
	      Document doc = SwfDocument.Document(root, meta);
	      if (logger.isInfoEnabled()){
	    	  logger.info("adding " + doc.get("path"));
	      }
          writer.addDocument(doc);
          if (logger.isInfoEnabled()){
	    	  logger.info("Optimizing index...");
	      }
          writer.optimize();	      
	      Date end = new Date();
	      if (logger.isInfoEnabled()){
	    	  logger.info("Total milliseconds = "+(end.getTime() - start.getTime()));
	      }

	   
	  }
	
	  public void finishIndex()
	  {
		  try {
			writer.close();
		} catch (CorruptIndexException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	  }
}
