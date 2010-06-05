<%-- 
    Document   : index
    Created on : 03/06/2010, 10:06:46 AM
    Author     : Markos
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
   "http://www.w3.org/TR/html4/loose.dtd">

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Message Generator</title>
        <script type="text/javascript" src="js/jquery.js"></script>
    </head>
    <body>
       <h1>Events Generator!</h1>
        <div id="conf_div">
            <form action="" method="POST">
                <label>XML(url lecture.xml):</label>
                <input id="urlconf" name="urlconf" type="text" />
                <input id="sendconf" name="sendconf" type="button" value="generate">
            </form>
        </div>
        <div id="display_message"></div>
        <script type="text/javascript">
              $(function() {
                $("#sendconf").click(function() {
                      var url = $("#urlconf").val();
                      var dataString = 'url=' + url;
                      $('#display_message').html("Wait, the XML is being parsed!!");
                      //alert (dataString);return false;
                      $.ajax({
                        type: "POST",
                        url: "XMLProcesser",
                        data: dataString,
                        success: function(xml) {
                          $('#display_message').html($(xml).find("message").text());
                        },
                        error: function(){
                          $('#display_message').html("There was an error!!");
                        }
                      });
                      return false;

                });
              });

        </script>

    </body>
</html>
