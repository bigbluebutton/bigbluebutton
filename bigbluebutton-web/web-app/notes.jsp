<%@ page contentType="text/plain" %><%--
--%><%@ page import="java.net.Socket" %><%--
--%><%@ page import="java.io.OutputStream" %><%--
--%><%@ page import="java.io.InputStream" %><%--
--%><%@ page import="java.io.BufferedInputStream" %><%--
--%><%
  /*
    This file is part of BBB-Notes.

    Copyright (c) Islam El-Ashi. All rights reserved.

    BBB-Notes is free software: you can redistribute it and/or modify
    it under the terms of the Lesser GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or 
    any later version.

    BBB-Notes is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    Lesser GNU General Public License for more details.

    You should have received a copy of the Lesser GNU General Public License
    along with BBB-Notes.  If not, see <http://www.gnu.org/licenses/>.

    Author: Islam El-Ashi <ielashi@gmail.com>, <http://www.ielashi.com>
  */

  /* This file is based on a source file on Google MobWrite JSP gateway (license below) */

  /*
  # MobWrite - Real-time Synchronization and Collaboration Service
  #
  # Copyright 2006 Google Inc.
  # http://code.google.com/p/google-mobwrite/
  #
  # Licensed under the Apache License, Version 2.0 (the "License");
  # you may not use this file except in compliance with the License.
  # You may obtain a copy of the License at
  #
  #   http://www.apache.org/licenses/LICENSE-2.0
  #
  # Unless required by applicable law or agreed to in writing, software
  # distributed under the License is distributed on an "AS IS" BASIS,
  # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  # See the License for the specific language governing permissions and
  # limitations under the License.

  # This server-side script connects the Ajax client to the Python daemon.
  # This is a minimal man-in-the-middle script.  No input checking from either side.

  # JSP MobWrite gateway by Erich Bratton http://bratton.com
  */
  
    Socket socket = null;

    try {
      // Connect to bbb-notes daemon
      socket = new Socket("127.0.0.1", 8095);

      // Timeout if daemon dosen't respond in 10 seconds.
      socket.setSoTimeout(10 * 1000);
      String data = request.getParameter("message") + "\0"; 

      // Write data to daemon
      OutputStream outputStream = socket.getOutputStream();
      outputStream.write(data.getBytes());

      // Read the response from daemon and copy it to JSP out
      InputStream inputStream = new BufferedInputStream(socket.getInputStream());
      int read;
      data = "";
      while ((read = inputStream.read()) > -1) {
        data += (char)read;
      }
  
      out.write(data);
    } catch (Exception e) {
       %><%= e.getMessage() %><%
    } finally {
  try {
    if (socket != null) {
      socket.close();
    }
  } catch (Exception e) {
    e.printStackTrace();
  }
}
%>
