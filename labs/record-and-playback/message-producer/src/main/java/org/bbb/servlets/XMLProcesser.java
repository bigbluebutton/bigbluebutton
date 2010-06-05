/*
 * BigBlueButton - http://www.bigbluebutton.org
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

 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 */

package org.bbb.servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import net.sf.json.xml.XMLSerializer;
import org.bbb.Event;
import org.bbb.IEvent;
import org.bbb.sender.IMessageGeneratorSender;
import org.bbb.sender.MessageGeneratorSender;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

/**
 *
 * @author Marco Calderon <mcmarkos86@gmail.com>
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
            String conferenceid=request.getParameter("conferenceid");
            String xml_param=request.getParameter("url");
            String output="";

            URL url=new URL(xml_param);
            XMLSerializer xmlser=new XMLSerializer();
            JSONObject json=(JSONObject) xmlser.readFromStream(url.openStream());
            JSONObject jsonpar=json.getJSONObject("par");
            JSONObject jsonseq=jsonpar.getJSONObject("seq");

            ArrayList<String> listmessages= new ArrayList<String>();
            listmessages.addAll(parseXMLtoJSON(jsonseq));

            for(int i=0;i<listmessages.size();i++){
                String message=(String) listmessages.get(i);
                IEvent event = null;
                event=new Event();
                ((Event)event).setConferenceID(conferenceid);
                ((Event)event).setMessage(message);
                ((Event)event).setUUID(java.util.UUID.randomUUID().toString());
                
                sendMessagesToQueue(event);
                try {
                    Thread.sleep(100);
                } catch (InterruptedException ex) {
                    Logger.getLogger(XMLProcesser.class.getName()).log(Level.SEVERE, null, ex);
                }
            }

            output="finish processing "+listmessages.size()+" objects";
            out.println("<message>"+output+"</message>");
        } finally { 
            out.close();
        }
    } 

    private void sendMessagesToQueue(IEvent event) {
        WebApplicationContext con = WebApplicationContextUtils.getRequiredWebApplicationContext(this.getServletContext());
        IMessageGeneratorSender sender=(MessageGeneratorSender) con.getBean("sender");
        sender.sendEvents(event);
    }

    private List<String> parseXMLtoJSON(JSONObject jsonseq){
        List<String> resp=new ArrayList<String>();
        ArrayList keys=new ArrayList(jsonseq.keySet());
        for(int idx=0;idx<keys.size();idx++){
            String type=(String) keys.get(idx);
            JSONArray jsonjoin=jsonseq.getJSONArray(type);
            Object[] array= jsonjoin.toArray();
            for(int i=0;i<array.length;i++)
            {
                JSONObject jsonobj=(JSONObject) array[i];
                jsonobj.put("event", type);
                jsonobj.put("version", "1");
                jsonobj.toString();
                resp.add(jsonobj.toString());
            }
        }

        return resp;
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
