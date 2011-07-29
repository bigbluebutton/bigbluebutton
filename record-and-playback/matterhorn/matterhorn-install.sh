#!/bin/bash
#
#Create Matterhorn installation directory
#
echo "Create Matterhorn installation directory"
echo "------------------------------------------------------"
echo "sudo mkdir -p /opt/matterhorn"
echo "------------------------------------------------------"
sudo mkdir -p /opt/matterhorn


echo "------------------------------------------------------"
echo "sudo chown $USER:$GROUPS /opt/matterhorn"
echo "------------------------------------------------------"
sudo chown $USER:$GROUPS /opt/matterhorn




#
#Update packages and install subversion
#

echo "Update packages and install subversion"
echo "------------------------------------------------------"
echo "sudo apt-get update --yes"
echo "------------------------------------------------------"
sudo apt-get update --yes


echo "------------------------------------------------------"
echo "sudo apt-get install subversion --yes"
echo "------------------------------------------------------"
sudo apt-get install subversion --yes




#
#Checkout Matterhorn 1.1 source in Matterhorn directory
#

echo "Checkout Matterhorn 1.1 source in Matterhorn directory"
echo "------------------------------------------------------"
echo "cd /opt/matterhorn"
echo "------------------------------------------------------"
cd /opt/matterhorn

echo "------------------------------------------------------"
echo "svn checkout http://opencast.jira.com/svn/MH/tags/1.1.0 /opt/matterhorn/1.1.0"
echo "------------------------------------------------------"
svn checkout http://opencast.jira.com/svn/MH/tags/1.1.0 /opt/matterhorn/1.1.0





#
#JAVA
#Update sources list
#

echo "Update sources list"
echo "------------------------------------------------------"
echo "deb http://archive.canonical.com/ubuntu lucid partner" >> /etc/apt/sources.list
echo "------------------------------------------------------"

echo "------------------------------------------------------"
echo "deb-src http://archive.canonical.com/ubuntu lucid partner" >> /etc/apt/sources.list
echo "------------------------------------------------------"




#
#Update packages
#
echo "Update packages"
echo "------------------------------------------------------"
echo "sudo apt-get update --yes"
echo "------------------------------------------------------"
sudo apt-get update --yes



#
#Install java
#
echo "Install Java"
sudo sh -c 'echo sun-java6-jdk shared/accepted-sun-dlj-v1-1 select true | /usr/bin/debconf-set-selections'
sudo apt-get install sun-java6-jdk --yes


#
#Set JAVA_HOME variable
#
echo "Set JAVA_HOME variable"
echo "------------------------------------------------------"
echo "export JAVA_HOME=/usr/lib/jvm/java-6-sun-1.6.0.24/" >> ~/.bashrc
echo "------------------------------------------------------"

echo "------------------------------------------------------"
echo "source ~/.bashrc"
echo "------------------------------------------------------"
source ~/.bashrc


#
#APACHE MAVEN
#Install maven
#
echo "Install Apache Maven"
echo "------------------------------------------------------"
echo "sudo apt-get install maven2 --yes"
echo "------------------------------------------------------"
sudo apt-get install maven2 --yes


#
#Set maven opts
#
echo "Set maven opts"
echo "------------------------------------------------------"
echo export MAVEN_OPTS='-Xms256m -Xmx960m -XX:PermSize=64m -XX:MaxPermSize=256m'
echo "------------------------------------------------------"


#
#APACHE FELIX
#Get the lastest release of Felix
#
echo "Get lastest release of Felix"
echo "------------------------------------------------------"
echo "cd /usr/src"
echo "------------------------------------------------------"
cd /usr/src
echo "------------------------------------------------------"
echo "sudo wget http://apache.deathculture.net//felix/org.apache.felix.main.distribution-3.2.2.tar.gz"
echo "------------------------------------------------------"
sudo wget http://apache.deathculture.net//felix/org.apache.felix.main.distribution-3.2.2.tar.gz


#
#Unarchive
#
echo "Unarchive"
echo "------------------------------------------------------"
echo "sudo tar xvf org.apache.felix.main.distribution-3.2.2.tar.gz"
echo "------------------------------------------------------"
sudo tar xvf org.apache.felix.main.distribution-3.2.2.tar.gz


#
#Move and rename unarchived folder to Matterhorn installation directory
#
echo "Move and rename unarchived folder to Matterhorn installation directory"
echo "------------------------------------------------------"
echo "sudo mv felix-framework-3.2.2 /opt/matterhorn/felix"
echo "------------------------------------------------------"
sudo mv felix-framework-3.2.2 /opt/matterhorn/felix


#
#Configure
#
echo "Configure"
echo "------------------------------------------------------"
echo "sudo mkdir /opt/matterhorn/felix/load"
echo "------------------------------------------------------"
sudo mkdir /opt/matterhorn/felix/load

echo "------------------------------------------------------"
echo "sudo cp -rf /opt/matterhorn/1.1.0/docs/felix/* /opt/matterhorn/felix/"
echo "------------------------------------------------------"
sudo cp -rf /opt/matterhorn/1.1.0/docs/felix/* /opt/matterhorn/felix/


#
#BUILD MATTERHORN
#Go to Matterhorn source directory, deploy
#
echo "Go to Matterhorn source directory, deploy"
echo "------------------------------------------------------"
echo "cd /opt/matterhorn/1.1.0/"
echo "------------------------------------------------------"
cd /opt/matterhorn/1.1.0/

echo "------------------------------------------------------"
echo "sudo mvn install -DskipTests=true -DdeployTo=/opt/matterhorn/felix/matterhorn"
echo "------------------------------------------------------"
#sudo mvn clean install -DskipTests=true -DdeployTo=/opt/matterhorn/felix/matterhorn
sudo mvn install -DskipTests=true -DdeployTo=/opt/matterhorn/felix/matterhorn


#
#THIRD PARTY TOOLS
#


echo "Fixing bug about libpng12 broken url. Replacing config data"
echo "New URL is : http://downloads.sourceforge.net/project/libpng/libpng12/1.2.46/libpng-1.2.46.tar.gz"

echo "URL: http://downloads.sourceforge.net/project/libpng/libpng12/1.2.46/libpng-1.2.46.tar.gz
PKG: libpng-1.2.46.tar.gz
SHA: d5f3a2439b0b6d85a26499b2be09918eb54ea13a
DIR: libpng-1.2.46
PCP: pc-png.zip" > /opt/matterhorn/1.1.0/docs/scripts/3rd_party/base_libs/png/config.txt


echo "Go to third party directory and run the script to install them"
echo "------------------------------------------------------"
echo "cd /opt/matterhorn/1.1.0/docs/scripts/3rd_party"
echo "------------------------------------------------------"
cd /opt/matterhorn/1.1.0/docs/scripts/3rd_party

echo "export necesary variables to compile"
echo "------------------------------------------------------"
echo "export HOME3P=/opt/matterhorn/1.1.0/docs/scripts/3rd_party"
echo "------------------------------------------------------"
export HOME3P=/opt/matterhorn/1.1.0/docs/scripts/3rd_party   # use absolute path, not "."
#export SUDOPWD=matt  # if needed

echo "Compile and log the compilation in do-all.log:"
echo "------------------------------------------------------"
echo "sudo ./do-all 2>&1 | tee do-all.log"
echo "------------------------------------------------------"
sudo ./do-all 2>&1 | tee do-all.log


#
#EXPORT ENVIRONMENT VARIABLES
#

echo "Export M2_REPO, FELIX_HOME, JAVA_OPTS"

echo "------------------------------------------------------"
echo "export M2_REPO=/home/$USER/.m2/repository"
echo "------------------------------------------------------"
echo "export M2_REPO=/home/$USER/.m2/repository" >> ~/.bashrc

echo "------------------------------------------------------"
echo "export FELIX_HOME=/opt/matterhorn/felix"
echo "------------------------------------------------------"
echo "export FELIX_HOME=/opt/matterhorn/felix" >> ~/.bashrc

echo "------------------------------------------------------"
echo "export JAVA_OPTS='-Xms1024m -Xmx1024m -XX:MaxPermSize=256m'"
echo "------------------------------------------------------"
echo "export JAVA_OPTS='-Xms1024m -Xmx1024m -XX:MaxPermSize=256m'" >> ~/.bashrc

echo "------------------------------------------------------"
echo "source ~/.bashrc"
echo "------------------------------------------------------"
source ~/.bashrc

#
#CONFIGURE MATTERHORN PARAMETERS
#


echo "Change server url "http://localhost" to your hostname"
ip=`ifconfig eth0 | sed -n 's/.*dr:\(.*\)\s Bc.*/\1/p'`
sed -i "s/org\.opencastproject\.server\.url=.*/org\.opencastproject\.server\.url=http:\/\/$ip:8080/g" /opt/matterhorn/felix/conf/config.properties

echo "Change storage directory to the dir where you want to store processed files"
sed -i "s/org\.opencastproject\.storage\.dir=.*/org\.opencastproject\.storage\.dir=\/opt\/matterhorn\/opencast/g" /opt/matterhorn/felix/conf/config.properties


#
#FELIX HOME
#Running Matterhorn could throw an error with FELIX_HOME so edit the script to run Matterhorn
#

echo "Change FELIX_HOME variable in star_matterhorn.sh script"
sed -i 's/FELIX=".*/  FELIX="\/opt\/matterhorn\/felix"/g' /opt/matterhorn/felix/bin/start_matterhorn.sh

echo "MATTERHORN Installed"
echo "To run, type on the command line "
echo "sudo /opt/matterhorn/felix/bin/start_matterhorn.sh"


