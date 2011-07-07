package org.bigbluebutton.webminer.web.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.apache.log4j.Logger;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.SimpleFormController;
import org.w3c.dom.Node;

import org.bigbluebutton.webminer.index.Index;
import org.bigbluebutton.webminer.web.model.IndexingContentSource;

public class CourseIndexingController extends SimpleFormController {

	private static Logger logger = Logger
			.getLogger(CourseIndexingController.class);

	private org.springframework.xml.xpath.XPathExpression slideExpression;
	private org.springframework.xml.xpath.XPathExpression slidePlayTimeExpression;

	/*
	 * (non-Javadoc)
	 * 
	 * @seeorg.springframework.web.servlet.mvc.SimpleFormController#
	 * processFormSubmission(javax.servlet.http.HttpServletRequest,
	 * javax.servlet.http.HttpServletResponse, java.lang.Object,
	 * org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView processFormSubmission(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors)
			throws Exception {

		return super.processFormSubmission(request, response, command, errors);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * org.springframework.web.servlet.mvc.SimpleFormController#onSubmit(javax
	 * .servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse,
	 * java.lang.Object, org.springframework.validation.BindException)
	 */
	@Override
	protected ModelAndView onSubmit(HttpServletRequest request,
			HttpServletResponse response, Object command, BindException errors) {
		// Get url of lecture.xml
		IndexingContentSource contentSourceCommand = (IndexingContentSource) command;
		String lectureXMLURL = contentSourceCommand.getLectureURL();
		System.out.println("in indexing");
		// Create DOM object for lecture.xml to extract presentation slide
		// location.
		try {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder parser = factory.newDocumentBuilder();
		org.w3c.dom.Document document = parser.parse(lectureXMLURL);

		String slideBaseURL = contentSourceCommand.getSlideBaseURL();
		List slideListResult = slideExpression.evaluateAsNodeList(document);
		List playTimeNodeList = slidePlayTimeExpression
				.evaluateAsNodeList(document);

			Map<String, String> slideTimeMap = new HashMap<String, String>();

			for (int i = 0; i < playTimeNodeList.size(); i++) {
				Node slideNode = (Node) playTimeNodeList.get(i);
				String slideTime = slideNode.getAttributes().getNamedItem(
						"time").getNodeValue();
				String slideIndex = slideNode.getTextContent();
				if (slideTimeMap.get(slideIndex) != null) {
					// if a slide has been played multiple times, appending all
					// times or only record the first play time
					
					  String value = slideTimeMap.get(slideIndex) + "||" + slideTime; 
					  slideTimeMap.put(slideIndex, value);
					 
				} else {
					slideTimeMap.put(slideIndex, slideTime);
				}
				if (logger.isInfoEnabled()) {
					logger
							.info("slide index = " + slideIndex + " "
									+ slideTime);
					logger.info("---Slide play time ---"
							+ (String) slideTimeMap.get(slideIndex));
				}

			}
			// Map <String, String> slideTimeMap = new HashMap<String,
			// String>();

			ArrayList<String> fileURLs = new ArrayList();
			String fileLocation = null;
			synchronized (Index.getInstance()) {
				Index.getInstance().startIndex(lectureXMLURL);
				// Index index = Index.getInstance();
				
				for (int i = 0; i < slideListResult.size(); i++) {
					Node node = (Node) slideListResult.get(i);
					String swfName = node.getNodeValue();
					fileLocation = slideBaseURL + swfName;
					fileURLs.add(i, fileLocation);
					Map attrs = new HashMap();
					// attrs.put("title", swfName);
					attrs.put("fileName", swfName);
					attrs.put("uid", lectureXMLURL);
					String idxToKey = (new Integer(i + 1)).toString();
					if (logger.isDebugEnabled()) {
						logger.debug("idxToKey"+idxToKey+" resultsize="+slideListResult.size()+"---Slide play time ---"
								+ (String) slideTimeMap.get(idxToKey)
								+ " summary = "
								+ contentSourceCommand.getSummary());
					}
					// Some slides in the file list may never be played, don't
					// show the slide time
					if (slideTimeMap.get(idxToKey) != null) {
						attrs.put("slideTime", "Slide " + idxToKey
								+ ": played at "
								+ (String) slideTimeMap.get(idxToKey));
					}
					attrs.put("summary", contentSourceCommand.getSummary());
					Index.getInstance().addIndex(fileLocation, attrs);

				}
				Index.getInstance().finishIndex();
			}
		} catch (Exception e) {
			System.out
					.println("-----------------exception -----------------------");
			Map<String, Object> model = new HashMap<String, Object>();
			model.put("generalError",
					"Please check the URL of files required by indexing");
			model.put("sourceContentURL", contentSourceCommand);
			return new ModelAndView(this.getFormView(), model);
		}

		return new ModelAndView(this.getSuccessView(), errors.getModel());
	}

	public org.springframework.xml.xpath.XPathExpression getSlideExpression() {
		return slideExpression;
	}

	public void setSlideExpression(
			org.springframework.xml.xpath.XPathExpression slideExpression) {
		this.slideExpression = slideExpression;
	}

	public org.springframework.xml.xpath.XPathExpression getSlidePlayTimeExpression() {
		return slidePlayTimeExpression;
	}

	public void setSlidePlayTimeExpression(
			org.springframework.xml.xpath.XPathExpression slidePlayTimeExpression) {
		this.slidePlayTimeExpression = slidePlayTimeExpression;
	}

}
