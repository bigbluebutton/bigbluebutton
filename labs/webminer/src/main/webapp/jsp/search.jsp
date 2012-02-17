<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<%@page import="java.util.Map,java.util.HashMap,java.util.Map,java.util.ArrayList,java.util.Iterator,java.util.Set,edu.carleton.webminer.web.model.MatchVO, edu.carleton.webminer.web.model.SessionHitsOrganizer"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link href="css/webminer.css" rel="stylesheet" type="text/css" />
<title>Search</title>
<%
	String criteria = (String) request.getAttribute("searchKeyword");

	if (criteria == null) {
		criteria = "";
	}
	String startFromStr =  (String) request.getAttribute("startFrom");
	int startFrom = (startFromStr == null) ? 0 : new Integer(startFromStr).intValue();

	boolean hasPrev = startFrom > 0 ? true : false;
	String endAtStr = (String) request.getAttribute("endAt");

	int endAt = 0;
	if (endAtStr != null) {
		endAt = (new Integer(endAtStr)).intValue();
	}

	int newValue = startFrom + 10;

	boolean hasNext = (startFrom + 10) > endAt ? false : true;
	
	String sortBy = (String) request.getAttribute("sortBy");
	String checkByScore = "checked";
	String checkBySession ="";
	if (sortBy!=null) {
		checkByScore = (sortBy.equalsIgnoreCase("byScore"))? "checked":"";
		checkBySession = (sortBy.equalsIgnoreCase("bySession"))? "checked":"";
	}
	String operator = (String) request.getAttribute("operator");
	String andOp = "checked";
	String orOp ="";
	if (operator!=null){
		andOp = (operator.equalsIgnoreCase("and"))?"checked":"";
		orOp = (operator.equalsIgnoreCase("or"))?"checked":"";
	}
	String rangeValue = (String) request.getAttribute("rangeValue");
	String rangeDsp=(rangeValue == null)?"none":"block";
	String advExpd = (rangeValue == null)? ">>":"<<";
	
	
%>
<script language="Javascript">
    var playerWin = null;
	function FetchNextPage() {
		var initialValue = document.getElementById("startFromEle").value;
		document.getElementById("startFromEle").value = parseInt(initialValue) + 10;
		//alert(document.getElementById("startFromEle").value);
		document.searchCriteria.submit();
	}
	function FetchPrevPage() {
		var initialValue = document.getElementById("startFromEle").value;
		document.getElementById("startFromEle").value = parseInt(initialValue) - 10;
		//alert(document.getElementById("startFromEle").value);
		document.searchCriteria.submit();
	}
	function launchPlayer(slideURL){
		var urlTokens = slideURL.split("/");
		var archive = "";
		var room="";
		var currentSlideNum="";
		for (var j=0; j<urlTokens.length; j++){
			if(urlTokens[j].indexOf("session-")>-1){
				archive = urlTokens[j];				
			}
			if (urlTokens[j].indexOf("-slide-")>-1){
				var fullName = urlTokens[j];
				var splitIndex = fullName.indexOf("-slide-");
				room=fullName.substring(0,splitIndex);
				currentSlideNum=urlTokens[j].substring(splitIndex+7,fullName.length-4);
				
			}	
		}
		//alert('archive='+archive+'&room='+room+'&currentSlideNum='+currentSlideNum);
		if((!playerWin)|| playerWin.closed){
			//playerWin = window.open('searchResultPlayer.htm?archive='+archive+'&room='+room+'&currentSlideNum='+currentSlideNum,null,'width=900, height=700');
			playerWin = window.open('http://localhost:8080/archivedLecture/searchResultPlayer.jsp?archive='+archive+'&room='+room+'&currentSlideNum='+currentSlideNum,null,'width=900, height=700');
		} else {
			playerWin.location="http://localhost:8080/archivedLecture/searchResultPlayer.jsp?archive="+archive+"&room="+room+"&currentSlideNum="+currentSlideNum;
		}
		playerWin.focus();
	}

	function launchPlayer2(allSlidesURL){
		var slidesURLs = allSlidesURL.split("%");
		var currentSlideURL='';
		for (var i=0; i<slidesURLs.length;i++){
			if (i==(slidesURLs.length-1)){
				currentSlideURL=slidesURLs[i];
			}
			alert(slidesURLs[i]);
		}
		
		var urlTokens = currentSlideURL.split("/");
		var archive = "";
		var room="";
		var currentSlideNum="";
		for (var j=0; j<urlTokens.length; j++){
			if(urlTokens[j].indexOf("session-")>-1){
				archive = urlTokens[j];	
				alert(archive);		
			}
			if (urlTokens[j].indexOf("-slide-")>-1){
				var fullName = urlTokens[j];
				var splitIndex = fullName.indexOf("-slide-");
				room=fullName.substring(0,splitIndex);
				currentSlideNum=urlTokens[j].substring(splitIndex+7,fullName.length-4);
						
			}	
		}
		var endNum = parseInt(currentSlideNum)+2;
		if((!playerWin)|| playerWin.closed){
			playerWin = window.open('searchResultPlayer2.htm?archive='+archive+'&room='+room+'&currentSlideNum='+currentSlideNum+'&startSlideNum=2&endSlideNum='+endNum,null,'width=900, height=700');
		} else {
			playerWin.location="searchResultPlayer2.htm?archive="+archive+"&room="+room+"&currentSlideNum="+currentSlideNum+'&startSlideNum=1&endSlideNum='+endNum;
		}
		playerWin.focus();
	}
	function launchPlayer3(allSlidesURL){
		var slidesURLs = allSlidesURL.split("%");
		var currentSlideURL='';
		//take the first relevant slide
		for (var i=0; i<slidesURLs.length;i++){
			currentSlideURL=slidesURLs[i];
			break;
		}
		
		launchPlayer(currentSlideURL);
	}

	function toggleDisplayOption(){
		
		var advOptEle = document.getElementById("advOpt");
		var advEle1 = document.getElementById("dspOpt1");
		if (advOptEle.innerHTML == "&gt;&gt;"){
			advEle1.style.display="block";
			advOptEle.innerHTML="&lt;&lt;";
		} else {
			advEle1.style.display="none";
			advOptEle.innerHTML="&gt;&gt;";
			var relRangeEle = document.getElementById('relRange');
			relRangeEle.value="";
		}		
	}
	

</script>
</head>
<body>
<form name="searchCriteria" action="search.htm" method="post">
<input type="hidden" id="startFromEle" name="startFrom"
	value="<%=startFrom%>"></input>
<table>
	<tr>
		<td class="title" colSpan="3">Search In Course: TTMG5101</td>
	</tr>
	<tr>
		<td class="field_label" colSpan="3">Search Criteria:</td>
	</tr>
	<tr>
		<td><input type="text" size="40" value="<%=criteria%>" name="keyWords"/></td>
		<td class="field_label"><input type="radio" name="operator" value="and" <%=andOp%>/>AND</td>
		<td class="field_label"><input type="radio" name="operator" value="or" <%=orOp%>/>OR</td>				
	</tr>
	<tr>
		<td class="field_label" colSpan="3">Result Display Settings:</td>		
	</tr>
	<tr>
		<td class="indented_label" colSpan="3"><input type="radio" name="sort" value="byScore" <%=checkByScore %>/> Sort By Score</td>
	</tr>
	<tr>
		<td class="indented_label" colSpan="3"><input type="radio" name="sort" value="bySession" <%=checkBySession %>/> Sort By Session</td>
	</tr>
	<tr>
		<td class="field_label" colSpan="3">Advanced Settings:<a id="advOpt" href="javascript:toggleDisplayOption()"><%=advExpd%></a></td>
	</tr>		
	<tr id="dspOpt1" style="display: <%=rangeDsp%>">
	    <td class="indented_label" colSpan="3">Relevant Score Range: <input type="text" size="2" id="relRange" value="<%=(rangeValue==null)?"":rangeValue%>"name="rangeValue" />&nbsp;(0~1)</td>
	</tr>
	<tr>
		<td class="submit_button" colSpan="3"><button type="submit">Search</button></td>
	</tr>
</table>

</form>
<div class="search_result">
<%  
	HashMap resultMap = (HashMap) request.getAttribute("result"); 
	HashMap hitsOrganizer = (HashMap) request.getAttribute("hitsOrganizer");
	boolean bSmart = (hitsOrganizer!=null);
%>
		
<table width="100%">
	
	    <% if (resultMap==null){ %>
	    <tr height="25px">
	    	<td class="result_table_header">Search Result </td>
	    </tr>
	    <tr>
			<td class="result_item_title">No Search Result.</td>
		</tr>
	    <% } else { 
	        int hColSpan = bSmart? 3:2;
	    %>
	    <tr>
			<td class="result_table_header" colSpan="<%=hColSpan%>">
		<%	if (hasPrev) {%>
			<a href="javascript:FetchPrevPage()">Previous 10</a>
		<%  } %>		
		    Search Result&nbsp;<font color="#000000">(<%=startFrom + 1%>~<%=endAt%>)</font>
		<%	if (hasNext) {%>
		    <a href="javascript:FetchNextPage()">Next 10</a>
		<%  } %>
			</td>
		</tr>
		<%		
	    	boolean hasResult = false;
	    	Set<String> keySet = resultMap.keySet();
			Iterator it = null;
			if (!keySet.isEmpty()){
				hasResult = true;
				it = keySet.iterator();			
			}
			if (!hasResult){
		%>
		<tr>
			<td class="result_item_title">No Search Result.</td>
		</tr>
		<%	} else {
			
			while (it.hasNext()){
				String filePath = (String) it.next();
				String allSlidesPath="";
				MatchVO matchVO = (MatchVO) resultMap.get(filePath);
				String title = matchVO.getIndexingSummary()+": "+matchVO.getFileName()+" (Match Score="+matchVO.getScore()+")";
				String summary = matchVO.getContentSummary();
				String playTime = (matchVO.getSlidePlayTime()!=null)?matchVO.getSlidePlayTime():null;
				int colSpan =(playTime==null)?3:1;
								
		%>		
		<tr>
		<td class="result_item_title" colSpan="<%=colSpan%>">
		 <a href="<%=filePath%>"><%=title%></a>
		 <div class="result_item_summary"><%=summary%></div>
		</td>
		<% 		if (!playTime.equals("-1")){ 
		    	  if (bSmart) {
		    		SessionHitsOrganizer sessionHitOrganier = matchVO.getSessionHitOrganier();
					ArrayList <String> relevantSlidesURL= sessionHitOrganier.getHitSlideGroup().get(filePath);
					for (int x=0; x<relevantSlidesURL.size();x++){
						allSlidesPath+=relevantSlidesURL.get(x)+"%";
						System.out.println(relevantSlidesURL.get(x));				
					}
					allSlidesPath += filePath;	    
	    %>	
	
		<td><a href="javascript:launchPlayer('<%=filePath%>')">Regular Play</a></td>
		<td><a href="javascript:launchPlayer3('<%=allSlidesPath%>')">Play Relevant</a></td>
	<%  		  } else {%>
		<td colSpan="2"><a href="javascript:launchPlayer('<%=filePath%>')">Play</a></td>
	<%			  }
	  	      	} %>	
	    </tr>
	
	<%      }
		    }
		   }		
	%>
	
	
	

</table>

</div>


</body>
</html>