package org.bigbluebutton.deskshare.servlet;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;

import javax.imageio.ImageIO;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.multiaction.MultiActionController;

public class FileUploadController2 extends MultiActionController {
	private static Logger log = Red5LoggerFactory.getLogger(FileUploadController2.class, "deskshare");
	
	public ModelAndView displaySlides(HttpServletRequest request, HttpServletResponse response) throws Exception {		
		log.warn("Got here");
		MultipartHttpServletRequest multipartRequest = (MultipartHttpServletRequest) request;
		// MultipartFile is a copy of file in memory, not in file system
		MultipartFile multipartFile = multipartRequest.getFile("upload");
	
		byte[] file = multipartFile.getBytes();
		
		InputStream imageData = new ByteArrayInputStream(file);
		//re-Create a BufferedImage we received over the network 
		BufferedImage image = ImageIO.read(imageData);
		log.warn("Received image size {}", file.length);
		String room = request.getParameterValues("room")[0];
		log.warn("Received image from room {}", room);
		String videoInfo = request.getParameterValues("videoInfo")[0];
		log.warn("Received image from videoInfo {}", videoInfo);
		
		getParameter("paramName");
		return null;
	}	
	
	private String getParameter(String paramName) {
		//Get the servlet context
		ServletContext ctx = getServletContext();
		log.info("Got the servlet context: {}", ctx);
		
		//Grab a reference to the application context
		ApplicationContext appCtx = (ApplicationContext) ctx.getAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE);
		log.info("Got the application context: {}", appCtx);
		
		//Get the bean holding the parameter
		MyBean bean = (MyBean) appCtx.getBean("mybean");
		String param = bean.getParameter();
		log.info("Got the parameter - {} = {}", paramName, param);
		
		bean.sendMessage("Pass this....");
		return param;
	}
}
