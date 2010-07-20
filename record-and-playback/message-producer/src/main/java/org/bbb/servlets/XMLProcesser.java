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
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.bbb.Event;
import org.bbb.IEvent;
import org.bbb.sender.IMessageGeneratorSender;
import org.bbb.sender.MessageGeneratorSender;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

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

            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document dom = db.parse(xml_param);

            Element docEle = dom.getDocumentElement();

            NodeList sequence_list=docEle.getElementsByTagName("seq").item(0).getChildNodes();
            int total=0;
            for(int i=0;i<sequence_list.getLength();i++){
                Node node_event=sequence_list.item(i);
                if(node_event.getNodeType()==Node.ELEMENT_NODE){
                    String json_message="{";

                    String activity=node_event.getNodeName();
                    json_message=json_message+"\"event\":\""+activity+"\"";

                    if(node_event.hasAttributes()){
                        NamedNodeMap event_attribs=node_event.getAttributes();
                        for(int j=0;j<event_attribs.getLength();j++){
                            Node attrib=event_attribs.item(j);
                            String attrib_name=attrib.getNodeName();
                            String attrib_value=attrib.getNodeValue();
                            json_message=json_message+",\""+attrib_name+"\":\""+attrib_value+"\"";
                        }
                    }
                    if(node_event.hasChildNodes()){
                        if(node_event.getFirstChild().getNodeType()==Node.TEXT_NODE){
                            String text=node_event.getFirstChild().getNodeValue().trim();
                            if(!text.equalsIgnoreCase("")){
                                json_message=json_message+",\"text\":\""+text+"\"";
                            }
                        }
                        NodeList subnodes=node_event.getChildNodes();
                        if(subnodes.getLength()>1)
                        {
                            json_message=json_message+",\""+subnodes.item(1).getNodeName()+"\":[";
                            for(int j=0;j<subnodes.getLength();j++){
                                Node subnode=subnodes.item(j);

                                if(subnode.getNodeType()==Node.ELEMENT_NODE){
                                    json_message=json_message+"\""+subnode.getFirstChild().getNodeValue()+"\"";
                                    json_message+=",";
                                }
                            }
                            json_message=json_message.substring(0, json_message.length()-1);
                            json_message+="]";
                        }
                    }

                    json_message+="}";

                    IEvent event =new Event();
                    ((Event)event).setConferenceID(conferenceid);
                    ((Event)event).setTimeStamp(System.currentTimeMillis());
                    ((Event)event).setMessage(json_message);

                    sendMessagesToQueue(event);
                    total++;
                    Thread.sleep(150);
                }
            }
            
            output="finish processing "+total+" objects";
            out.println("<message>"+output+"</message>");
        }catch(Exception ex){
            Logger.getLogger(XMLProcesser.class.getName()).log(Level.SEVERE, null, ex);
        }finally {
            out.close();
        }
    } 

    private void sendMessagesToQueue(IEvent event) {
        WebApplicationContext con = WebApplicationContextUtils.getRequiredWebApplicationContext(this.getServletContext());
        IMessageGeneratorSender sender=(MessageGeneratorSender) con.getBean("sender");
        sender.sendEvents(event);
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
