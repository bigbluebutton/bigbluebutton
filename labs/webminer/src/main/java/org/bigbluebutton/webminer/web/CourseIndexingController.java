package org.bigbluebutton.webminer.web;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.Controller;

public class CourseIndexingController implements Controller {
	
	protected final Log logger=LogFactory.getLog(getClass());
	

	@Override
	public ModelAndView handleRequest(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		logger.info("Go to course indexing page");
		return new ModelAndView("courseIndexing.jsp");
		
	}

}
