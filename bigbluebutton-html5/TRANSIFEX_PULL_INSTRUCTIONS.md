# Localization with Transifex

We use Transifex for crowdsourcing for BigBlueButton Internationalization(i18n). The following steps are not a part of the typical installation and are only required for bringing the language strings in github up to date. There are two ways to pull the translation files; using the transifex.sh script or the transifex client.

## Using transifex.sh

The transifex.sh script aims to make retrieving translation files on the Transifex servers as simple as possible. In order to use the script, you must provide your Transifex credentials which have the appropriate authorization. The script can be used in the following ways.

~~~
$ ./transifex.sh all
~~~

Using the all argument will tell the script to download all available translation files.

~~~
$ ./transifex.sh fr de pt-BR
~~~

If you only need a specific set of translations, the script can be run with the required locales as argument.


## Setup & Configure Transifex Client

This is an alternative method to using the transifex.sh and is essentially the manual process for retrieving translation files from the Transifex servers.

### 1. Install Transifex Client ###

To installation the Transifex client we use pip, a package management system designed to manage and install Python packages.

~~~
$ sudo apt-get install python-pip
~~~

Next we use Pip to install the Transifex client.

~~~
$ sudo pip install transifex-client
~~~

The following command is used to upgrade the client to the most current version.

~~~
$ pip install --upgrade transifex-client
~~~

### 2. Transifex Project Initialization ###

The `tx init` command is used to initialize a project. Run from the root directory of the application.

~~~
$ tx init
Creating .tx folder. . .
Transifex instance [https://www.transifex.com]:
~~~

Press Enter (will be prompted for your Transifex username and password)

~~~
Creating skeleton...
Creating config file...
​Done.
~~~

This will create a Transifex project file in the current directory containing the project’s configuration file.


### 3. Transifex Client configuration ###
#### .tx/config ####

The Transifex client uses a per project configuration file. This is located in .tx/config of your project's root directory and is generated on running the `tx init` command. It should be updated with the following configuration:

~~~
[main]
host = https://www.transifex.com

[bigbluebutton-html5.enjson]
file_filter = private/locales/<lang>.json
source_file = private/locales/en_US.json
source_lang = en_US
type = KEYVALUEJSON
~~~


### 4. Set a Project Remote ###

`tx set` allows you to configure and edit Transifex project files on your local computer.

The following command is used to initialize a local project for the remote project specified by the URL.

`$ tx set --auto-remote https://www.transifex.com/projects/p/bigbluebutton-html5/resources/enjson/`

Next we can pull language files located on the Transifex server.


### 5. Pull: Download Transifex Translations ###

To pull all translation files from the Transifex server, the following command is used.

`$ tx pull -a bigbluebutton-html5.enjson`

In the event that there are a lot of translations, instead of pulling all, we can specify which translations we want to acquire.

`$ tx pull -r bigbluebutton-html5.enjson -l pt_BR`

Alternatively, simply download a ZIP archive of all languages in the project from the Transifex project page and unarchive it in the `private/locales/` directory.
