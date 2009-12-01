import java.util.regex.Matcher;
import java.util.regex.Pattern;


public class ParseParticipants {
	private static final Pattern KONFERENCE_LIST_PATTERN = Pattern.compile("^MemberId:(.+)CIDName:(.+)CID:(.+)Audio:(.+)UniqueID:(.+)ConfName:(.+)Channel:(.+)$");

    /*
MemberId: 1                    CIDName: R ALAM               CID: 3000                 Audio: Unmuted              UniqueID: 1259687833.2         ConfName: 85115                Channel: SIP/3000-09d17408                                                               
MemberId: 2                    CIDName: R ALAM               CID: 3000                 Audio: Unmuted              UniqueID: 1259687852.3         ConfName: 85115                Channel: SIP/3000-09d277c8                                                               
     */
	
	/**
	 * @param args
	 */
	public static void main(String[] args) {
		String line = "MemberId: 1                    CIDName: R ALAM               CID: 3000                 Audio: Unmuted              UniqueID: 1259687833.2         ConfName: 85115                Channel: SIP/3000-09d17408                                                               ";
		final Matcher matcher;
        

        matcher = KONFERENCE_LIST_PATTERN.matcher(line);
        if (!matcher.matches())
        {
            System.out.println("NO MATCHES");
        } else {
        	System.out.println("FOUND MATCHES");
        	for (int i=0; i<=matcher.groupCount(); i++) {
                String groupStr = matcher.group(i);
                System.out.println("[" + i + "] = " + groupStr.trim());
            }
        }
        
        boolean matchFound = matcher.find();
        
        if (matchFound) {
            // Get all groups for this match
            for (int i=0; i<=matcher.groupCount(); i++) {
                String groupStr = matcher.group(i);
                System.out.println(groupStr);
            }
        }
        System.out.println("DONE");
	}

}
