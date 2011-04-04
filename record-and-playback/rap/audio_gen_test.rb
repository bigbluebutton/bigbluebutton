require 'lib/recordandplayback/generators/audio'

s1 = "/tmp/audio1.wav"
s2 = "/tmp/audio2.wav"

g = Generator::Audio.new
g.generate_silence(20, s1, 16000)
g.generate_silence(20, s2, 16000)

d = "/home/firstuser/dev/source/bigbluebutton/record-and-playback/rap/resources/raw/1b199e88-7df7-4842-a5f1-0e84b781c5c8/audio"
f1 = "#{d}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041247.wav"
f2 = "#{d}/1b199e88-7df7-4842-a5f1-0e84b781c5c8-20110202-041415.wav"

files = [f1, s1, f2, s2]
outf = "/tmp/final.wav"

g.concatenate_audio_files(files, outf)
wav_file = outf
ogg_file = "/tmp/final.ogg"

g.wav_to_ogg(wav_file, {:artist => "Budka Suflera",
                        :album => "Za Ostatni Grosz",
                        :track => 1,
                        :title => "Za Ostatni Grosz",
                        :date => "1981-05-01",
                        :composer => "composer=Romuald Lipko, Marek Dutkiewicz"},
              ogg_file)
              
    


