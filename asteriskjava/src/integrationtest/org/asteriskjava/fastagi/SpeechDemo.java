package org.asteriskjava.fastagi;

import java.io.IOException;

public class SpeechDemo extends BaseAgiScript
{
    // the digits grammar is shipped as part of the Lumenvox engine
    private final String grammarPath = "/etc/lumenvox/Lang/BuiltinGrammars/ABNFDigits.gram";

    public void service(AgiRequest request, AgiChannel channel) throws AgiException
    {
        try
        {
            // answer the call
            answer();

            // and say hello
            streamFile("speech-demo/welcome");

            // initialize the speech engine
            speechCreate();
        }
        catch (AgiHangupException e)
        {
            System.out.println("User hung up.");
        }
        catch (AgiSpeechException e)
        {
            System.out.println("Unable to initialize speech engine: no speech engine installed or licence trouble.");
            streamFile("speech-demo/engine-error");
            hangup();
            return;
        }

        try
        {
            while (true)
            {
                recognizeDigits();
            }
        }
        catch (AgiHangupException e)
        {
            System.out.println("User hung up.");
        }
        finally
        {
            try
            {
                // make sure to destroy the speech object otherwise licenses might leak.
                speechDestroy();
            }
            catch (Exception e)
            {
                // swallow
            }
        }
    }

    public void recognizeDigits() throws AgiException
    {
        final String grammarLabel = "digits";

        // load the grammar we are going the use
        speechLoadGrammar(grammarLabel, grammarPath);

        // active it
        speechActivateGrammar(grammarLabel);

        // and use if for recognition
        SpeechRecognitionResult result = speechRecognize("speech-demo/prompt", 10);
        System.out.println(result);

        // deactivate the grammar
        speechDeactivateGrammar(grammarLabel);

        // check whether speech was recognized or a DTMF digit was pressed
        if (result.isSpeech())
        {
            // if speech was recognized look at the confidence score
            if (result.getScore() > 990)
            {
                streamFile("speech-demo/absolutely-sure");
            }
            else if (result.getScore() > 800)
            {
                streamFile("speech-demo/pretty-sure");
            }
            else
            {
                streamFile("speech-demo/not-sure");
            }

            // say what we have recognized
            sayDigits(result.getText());
        }
        else if (result.isDtmf())
        {
            // if the user pressed a DTMF digit
            streamFile("speech-demo/dtmf");

            // read it back to him
            if (result.getDigit() == '*')
            {
                streamFile("digits/star");
            }
            else if (result.getDigit() == '#')
            {
                streamFile("digits/pound");
            }
            else
            {
                sayDigits(Character.toString(result.getDigit()));
            }
        }
        else
        {
            // if we received no input play an error message
            streamFile("speech-demo/no-input");
        }
    }

    public static void main(String[] args) throws IOException
    {
        AgiServerThread agiServerThread = new AgiServerThread();
        agiServerThread.setAgiServer(new DefaultAgiServer());
        agiServerThread.setDaemon(false);
        agiServerThread.startup();
    }
}