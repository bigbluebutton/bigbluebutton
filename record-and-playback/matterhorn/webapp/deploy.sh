DEPLOY_DIR=/var/www/bigbluebutton/matterhorn

if [ "$(whoami)" != "root" ]; then
    echo "Please run the script as root."
    exit 1
fi

echo "Deleting old files..."
rm -r $DEPLOY_DIR

if [ ! -e $DEPLOY_DIR ] 
then
	echo "Creating deployment directory ${DEPLOY_DIR}..."
	mkdir $DEPLOY_DIR
fi

echo "Copying new files..."

cp -r "./views" $DEPLOY_DIR
cp "bigbluebutton.yml" $DEPLOY_DIR
cp "config.ru" $DEPLOY_DIR
cp "main.rb" $DEPLOY_DIR
mkdir $DEPLOY_DIR"/log"
mkdir $DEPLOY_DIR"/tmp"

echo "Installing matterhorn webapp in thin..."
# see http://code.macournoyer.com/thin/usage/
thin config -C "/etc/thin/matterhorn.yml" -c $DEPLOY_DIR"/" --servers "1" -e "production"

echo "**************************************************"
echo "For start the thin server: sudo service thin start"
echo "**************************************************"
