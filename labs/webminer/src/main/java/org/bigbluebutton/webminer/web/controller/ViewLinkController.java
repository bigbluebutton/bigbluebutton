package org.bigbluebutton.webminer.web.controller;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;

public class ViewLinkController extends MultiActionController {
	public ViewLinkController() {
		super();
	}

	public ModelAndView launchCourseIndexing(HttpServletRequest req,
			HttpServletResponse response) throws Exception {
		
		return new ModelAndView("courseIndexing");
	}
	public ModelAndView launchSearch(HttpServletRequest req,
			HttpServletResponse response) throws Exception {

		return new ModelAndView("search");
	}
	public ModelAndView launchResultPlayer(HttpServletRequest req,
			HttpServletResponse response) throws Exception {
		
		return new ModelAndView("searchResultPlayer");
	}
	public ModelAndView launchResultPlayer2(HttpServletRequest req,
			HttpServletResponse response) throws Exception {
		
		return new ModelAndView("searchResultPlayer2");
	}
	public ModelAndView launchWelcomePage(HttpServletRequest req,
			HttpServletResponse response) throws Exception {
		
		return new ModelAndView("index");
	}

}
