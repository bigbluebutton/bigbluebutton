/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/

package connection;

import java.util.ArrayList;
import java.util.Scanner;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

import java.io.File;
import java.io.FileReader;
import java.net.InetAddress;
import java.net.UnknownHostException;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

/**
 * @author 	Chad Pilkey <capilkey@gmail.com>
 * @version	1.0
 * @since	2012-03-05
 */
public class JedisConnection {
	JedisPool redisPool;

	String pollKey;
	String title;
	String question;
	String multiple;
	ArrayList<String> answers;
	
	String curWebKey;
	ArrayList<String> pollsVoted = new ArrayList<String>();
	
	private static String BBB_FILE =
		"/var/lib/tomcat6/webapps/bigbluebutton/WEB-INF/classes/bigbluebutton.properties";
	private static String BBB_SERVER_FIELD = "bigbluebutton.web.serverURL";
	
	public static Jedis dbConnect(){
        String serverIP = "127.0.0.1";
        //String serverIP = getLocalIP();
        //serverIP = serverIP.substring(7);
        JedisPool redisPool = new JedisPool(serverIP, 6379);
        try{
        	return redisPool.getResource();
        }
        catch (Exception e){
        	//log.error("Error in PollApplication.dbConnect():");
        	///log.error(e.toString());
        }
        //log.error("Returning NULL from dbConnect()");
        return null;
	}

	/*private static String getLocalIP() {
		File parseFile = new File(BBB_FILE);
		try{
			Scanner scanner = new Scanner(new FileReader(parseFile));
			Boolean found = false;
			String serverAddress = "";
			while (!found && scanner.hasNextLine()){
                serverAddress = processLine(scanner.nextLine());
                if (!serverAddress.equals("")){
                	found = true;
                }
			}
			scanner.close();
			return serverAddress;
		}
		catch (Exception e){
			//log.error("Error in scanning " + BBB_FILE + " to find server address.");
		}
		return null;
	}

	private static String processLine(String line) {
		//use a second Scanner to parse the content of each line
		Scanner scanner = new Scanner(line);
		scanner.useDelimiter("=");
		if ( scanner.hasNext() ){
			String name = scanner.next();
			if (name.equals(BBB_SERVER_FIELD)){
				String value = scanner.next();
				return value;
			}
		}
		return "";
	}*/
	/**
	 * Retrieves a poll from the local computer's Redis database.
	 * 
	 * @param webKey 	4 digit number for poll you want
	 * @return 			Returns true if the poll is retrieved otherwise false
	 */
	public boolean retrievePoll(String webKey) {
		Jedis jedis = dbConnect();

		if (jedis.exists(webKey) && jedis.hget(jedis.get(webKey), "title") != null) {
			curWebKey = webKey;
			
			pollKey = jedis.get(webKey);
			title = jedis.hget(pollKey, "title");
			question = jedis.hget(pollKey, "question");
			multiple = jedis.hget(pollKey, "multiple");
			
			long pollSize = jedis.hlen(pollKey);
			int otherFields = 10;
	 	   	long numAnswers = (pollSize-otherFields)/2;
	 	   	
	 	   	answers  = new ArrayList <String>();
	 	   	
	 	   	for (int j = 1; j <= numAnswers; j++) {
	 	   		answers.add(jedis.hget(pollKey, "answer"+j+"text"));
	 	   	}
	 	   	
	 	   	return true;
		} else
			return false;
		
	}
	
	/**
	 * Increases the passed answer's vote count by one and also increases 
	 * the total votes by one.
	 * 
	 * @param vote		the answer number of the answer to be increased
	 */
	public void recordRadioVote(String vote) {
		Jedis jedis = dbConnect();
		
		jedis.hincrBy(pollKey, "totalVotes", 1);
		jedis.hincrBy(pollKey, "answer"+vote, 1);
		
		pollsVoted.add(curWebKey);
	}
	
	/**
	 * Increases each of the passed answers' vote counts by one and
	 * increases the total votes by one.
	 * 
	 * @param votes		the answer numbers to be increased
	 */
	public void recordCheckVote(String [] votes) {
		Jedis jedis = dbConnect();
		
		jedis.hincrBy(pollKey, "totalVotes", 1);
		
		for (int i=0; i<votes.length; i++) {
			jedis.hincrBy(pollKey, "answer"+votes[i], 1);
		}
		
		pollsVoted.add(curWebKey);
	}
	
	/**
	 * Tries to find the passed webkey in the contents of the passed string.
	 * 
	 * @param cv		the contents of the bigbluebutton cookie
	 * @param webkey	the webkey that you want to search for
	 * @return			true if the webkey is found, otherwise false
	 */
	public boolean cookieCheck(String cv, String webkey) {
		Pattern p = Pattern.compile(","+webkey+",");
		Matcher m = p.matcher(cv);
		return m.find(0);
	}
	
	/**
	 * Checks the passed webkey for any non-digit character.
	 * 
	 * @param key		the webkey that you want to check
	 * @return			true if a non-digit character is found, otherwise false
	 */
	public boolean cleanWebKey(String key) {
		Pattern p = Pattern.compile("[^\\d]");
		Matcher m = p.matcher(key);
		return m.find(0);
	}
	
	/** 
	 * Checks the current object to see if the poll has already been voted on.
	 * 
	 * @param poll		poll to try and find
	 * @return			true if the poll has already been voted on, otherwise false
	 */
	public boolean sessionVoted(String poll) {
		return pollsVoted.contains(poll);
	}
	
	public String getTitle() {
		return title;
	}
	
	public String getQuestion() {
		return question;
	}
	
	public String getMultiple() {
		return multiple;
	}
	
	public String [] getAnswers() {
		String [] temp = new String [answers.size()];
		return answers.toArray(temp);
	}
	
	public String getWebKey() {
		return curWebKey;
	}
}
