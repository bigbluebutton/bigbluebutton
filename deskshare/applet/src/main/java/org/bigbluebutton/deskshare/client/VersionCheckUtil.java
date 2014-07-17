package org.bigbluebutton.deskshare.client;

public class VersionCheckUtil {

	public static boolean validateMinJREVersion(String runtimeVersion, String minVersion){
		String[] requestedVersioning = minVersion.split("\\.");
		String[] clientVersioning = runtimeVersion.split("\\.");

		if (requestedVersioning.length < 3 || clientVersioning.length < 3)
			return false;

		// First major update
		if (Integer.parseInt(clientVersioning[0]) > Integer.parseInt(requestedVersioning[0]))
			return true;
		else{
			// Checking Java version
			if(Integer.parseInt(clientVersioning[1]) > Integer.parseInt(requestedVersioning[1]))
				return true;

			// Checking update
			else if(Integer.parseInt(clientVersioning[1]) == Integer.parseInt(requestedVersioning[1])){	
				// non-GA or non-FCS release won't be supported
				if(clientVersioning[2].indexOf("-") != -1)
					return false;

				int rUpdatePart1 = 0;
				int rUpdatePart2 = 0;

				int underbar = requestedVersioning[2].indexOf("_");
				if( underbar == -1){
					rUpdatePart1 = Integer.parseInt(requestedVersioning[2]);
				}else{
					rUpdatePart1 = Integer.parseInt(requestedVersioning[2].substring(0,underbar-1));
					rUpdatePart2 = Integer.parseInt(requestedVersioning[2].substring(underbar+1,requestedVersioning[2].length()-1));	
				}

				int cUpdatePart1 = 0;
				int cUpdatePart2 = 0;

				underbar = clientVersioning[2].indexOf("_");
				if( underbar == -1){
					cUpdatePart1 = Integer.parseInt(clientVersioning[2]);
				}else{
					cUpdatePart1 = Integer.parseInt(clientVersioning[2].substring(0,underbar-1));
					cUpdatePart2 = Integer.parseInt(clientVersioning[2].substring(underbar+1,clientVersioning[2].length()-1));	
				}

				if(cUpdatePart1 > rUpdatePart1)
					return true;
				else if(cUpdatePart1 == rUpdatePart1)
				{
					if(cUpdatePart2 > rUpdatePart2 || cUpdatePart2 == rUpdatePart2)
						return true;
					else
						return false;
				}else
					return false;
			}else
				return false;
		}
	}
	
}
