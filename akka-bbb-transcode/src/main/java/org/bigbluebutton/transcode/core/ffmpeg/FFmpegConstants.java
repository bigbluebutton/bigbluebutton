package org.bigbluebutton.transcode.core.ffmpeg;

public class FFmpegConstants {

    //exit codes (obtained from process exit code)
    public static final int FATAL_ERROR_CODE = 128;
    public static final int EXIT_WITH_SUCCESS_CODE = 0;
    public static final int EXIT_WITH_NO_INPUT_CODE = 1;
    public static final int EXIT_WITH_SIGKILL_CODE = FATAL_ERROR_CODE + 9;
    public static final int ACCEPTABLE_EXIT_CODES[] = {EXIT_WITH_SUCCESS_CODE,EXIT_WITH_SIGKILL_CODE};

    //status codes (obtained from sterr/out)
    public static final int EXIT_WITH_SUCCESS_STATUS = 0;
    public static final int EXIT_WITH_NO_INPUT_STATUS = 1;
    public static final int RUNNING_STATUS = 2;
    public static final int ACCEPTABLE_EXIT_STATUS[] = {EXIT_WITH_SUCCESS_STATUS,EXIT_WITH_NO_INPUT_STATUS};

    //output constants (obtained from verbose stderr/out)
    public static String FFMPEG_EXIT_WITH_NO_INPUT_OUTPUT = "Connection timed out";
    public static String WIDTH = "width";
    public static String HEIGHT = "height";

    //Codecs
    public static final String CODEC_ID_H264 = "96" ;
    public static final String CODEC_NAME_H264 = "H264" ;
    public static final String SAMPLE_RATE_H264 = "90000" ;

    public static boolean acceptableExitCode(int code){
        int i;
        if ((ACCEPTABLE_EXIT_CODES == null) || (code < 0)) return false;
        for(i=0;i<ACCEPTABLE_EXIT_CODES.length;i++)
            if (ACCEPTABLE_EXIT_CODES[i] == code)
                return true;
        return false;
    }

    public static boolean acceptableExitStatus(int status){
        int i;
        if ((ACCEPTABLE_EXIT_STATUS == null) || (status < 0)) return false;
        for(i=0;i<ACCEPTABLE_EXIT_STATUS.length;i++)
            if (ACCEPTABLE_EXIT_STATUS[i] == status)
                return true;
        return false;
    }
}
