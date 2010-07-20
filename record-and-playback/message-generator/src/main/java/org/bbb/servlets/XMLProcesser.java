/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

package org.bbb.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.bbb.classes.IMessageGeneratorSender;
import org.bbb.classes.MessageGeneratorSender;
import org.bbb.classes.Utils;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 *
 * @author Markos
 */
public class XMLProcesser extends HttpServlet {
   
    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        
        response.setContentType("text/xml");
        PrintWriter out = response.getWriter();
        try {
            String url_param=request.getParameter("url");

            String message="";
            ArrayList listmapvalues=Utils.parseLectureXML(Utils.parseXmlFile(url_param));
            for(int i=0;i<listmapvalues.size();i++){
                Map<String,String> mapvalues=(Map<String, String>) listmapvalues.get(i);
                
                //Send messages
                sendMessagesToQueue(mapvalues);
            }

            out.println("<message>"+message+"</message>");
        } finally { 
            out.close();
        }

        //here is the code for post-processing

    } 

    private void sendMessagesToQueue(Map<String, String> mapvalues) {
        //ApplicationContext con = new ClassPathXmlApplicationContext("WEB-INF/spring-config/JMSMessageGeneratorConfig.xml");
        WebApplicationContext con = WebApplicationContextUtils.getRequiredWebApplicationContext(this.getServletContext());
        IMessageGeneratorSender sender=(MessageGeneratorSender) con.getBean("sender");
        sender.sendEvents(mapvalues);

        /*Object lock = new Object();
        synchronized(lock){
            try {
                lock.wait();

            } catch (InterruptedException ex) {
                Logger.getLogger(XMLProcesser.class.getName()).log(Level.SEVERE, null, ex);
            }
        }*/
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /** 
     * Handles the HTTP <code>GET</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        processRequest(request, response);
    } 

    /** 
     * Handles the HTTP <code>POST</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Returns a short description of the servlet.
     * @return a String containing servlet description
     */

    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

    



}
