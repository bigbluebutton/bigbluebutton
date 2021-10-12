Last change on Feb 16, 2021

This directory contains files needed for the correct deployment of bigbluebutton-html5 **on a development environment**. 

They are very similar, or even identical to the files used for `bbb-html5` packaging, however, the main difference is that this set of files may be unintentionally **out of date**.
 
The script `deploy_to_usr_share.sh` was written to allow developers to be able to wipe out the `/usr/share/meteor` directory where `bbb-html5` package is installed, and at the same time build their local code and deploy it so it replaces the default `bbb-html5`. The script has been indispensible during the work on https://github.com/bigbluebutton/bigbluebutton/pull/11317 where multiple NodeJS processes were to run simultaneously but using different configuration.


