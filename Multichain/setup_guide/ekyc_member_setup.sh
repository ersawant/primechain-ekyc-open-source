#!/bin/bash

source config.conf

seed_node_ip=$1
rpcuser=`< /dev/urandom tr -dc A-Za-z0-9 | head -c15; echo`
rpcpassword=`< /dev/urandom tr -dc A-Za-z0-9 | head -c40; echo`

if ! id $linux_admin_user >/dev/null 2>&1; then
	# Setting up user account
	echo '----------------------------------------'
	echo -e 'SETTING UP '$linux_admin_user' USER ACCOUNT:'
	echo '----------------------------------------'

	passwd=`< /dev/urandom tr -dc A-Za-z0-9 | head -c40; echo`
	sudo useradd -d /home/$linux_admin_user -s /bin/bash -m $linux_admin_user
	sudo usermod -a -G sudo $linux_admin_user
	echo $linux_admin_user":"$passwd | sudo chpasswd
	echo "$linux_admin_user ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers    
fi

homedir=`su -l $linux_admin_user -c 'cd ~ && pwd'`

echo '----------------------------------------'
echo -e 'INSTALLING PREREQUISITES.....'
echo '----------------------------------------'

echo '----------------------------------------'
echo -e 'INSTALLING Nodejs.....'
echo '----------------------------------------'

curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs

echo '----------------------------------------'
echo -e 'INSTALLING PM2.....'
echo '----------------------------------------'

sudo npm install -g pm2

echo '----------------------------------------'
echo -e 'INSTALLING MONGODB.....'
echo '----------------------------------------'

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org

echo '----------------------------------------'
echo -e 'STARTING MONGODB.....'
echo '----------------------------------------'

sudo systemctl start mongod

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

echo -e '----------------------------------------'
echo -e 'PREREQUISITES SUCCESSFULLY SET UP!'
echo -e '----------------------------------------'

sudo apt-get --assume-yes update
sudo apt-get --assume-yes install jq git aptitude

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

sleep 3
echo '----------------------------------------'
echo -e 'CONFIGURING FIREWALL.....'
echo '----------------------------------------'

sudo ufw allow $networkport
sudo ufw allow $rpcport

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

echo -e '----------------------------------------'
echo -e 'FIREWALL SUCCESSFULLY CONFIGURED!'
echo -e '----------------------------------------'

echo '----------------------------------------'
echo -e 'INSTALLING & CONFIGURING MULTICHAIN.....'
echo '----------------------------------------'

wget --no-verbose http://www.multichain.com/download/multichain-$multichainVersion.tar.gz
sudo bash -c 'tar xvf multichain-'$multichainVersion'.tar.gz'
sudo bash -c 'cp multichain-'$multichainVersion'*/multichain* /usr/local/bin/'

echo '-------------------------------------------'
echo -e 'INITIATING CONNECTION TO BLOCKCHAIN.....'
echo '-------------------------------------------'

set +e
su -l $linux_admin_user -c 'multichaind '$chainname'@'$seed_node_ip':'$networkport' -daemon'
set -e

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''

x="no"
while [ $x != "yes" ]
do
	echo -e 'GRANT PERMISSION FROM THE SEED NODE AND TYPE yes TO CONTINUE...'
	read x
done

su -l $linux_admin_user -c "echo rpcuser='$rpcuser' > $homedir/.multichain/$chainname/multichain.conf"
su -l $linux_admin_user -c "echo rpcpassword='$rpcpassword' >> $homedir/.multichain/$chainname/multichain.conf"
su -l $linux_admin_user -c 'echo rpcport='$rpcport' >> '$homedir'/.multichain/'$chainname'/multichain.conf'

su -l $linux_admin_user -c 'multichaind '$chainname'@'$seed_node_ip':'$networkport' -daemon'

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

sleep 3

echo '----------------------------------------'
echo -e 'SUBSCRIBING TO STREAMS.....'
echo '----------------------------------------'

# SUBSCRIBE STREAMS
# --------- -------

su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_MEMBER_MASTERLIST_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_DATA_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_RECORD_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_OTHER_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_SIGNATURE_STREAM"


echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

x="no"
while [ $x != "yes" ]
do
	echo -e 'GRANT WRITING PERMISSION TO KYC_MEMBER_MASTERLIST_STREAM FROM THE SEED NODE AND TYPE yes TO CONTINUE...'
	read x
done

echo -e '----------------------------------------'
echo -e 'BLOCKCHAIN SUCCESSFULLY SET UP!'
echo -e '----------------------------------------'


echo '----------------------------------------'
echo -e 'SETTING UP APPLICATIONS.....'
echo '----------------------------------------'

## Create Directories
##------- ------------
su -l $linux_admin_user -c 'mkdir -p '$homedir'/primechain-products'

###
## INSTALLING & CONFIGURING Primechain-KYC-MEMBER
###
su -l $linux_admin_user -c 'cd ~/primechain-products && git clone https://github.com/Primechain/primechain-ekyc-open-source.git'

# Configuring Primechain-MONEY
# ----------- --------------------------
sudo sed -ie 's/RPC_PORT:.*,/RPC_PORT: "'$rpcport'",/g' $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member/configs/blockchain_config.js
sudo sed -ie 's/RPC_USER:.*,/RPC_USER: "'$rpcuser'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member/configs/blockchain_config.js
sudo sed -ie 's/RPC_PASSWORD:.*,/RPC_PASSWORD: "'$rpcpassword'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member/configs/blockchain_config.js
sudo sed -ie 's/IP_ADDRESS:.*,/IP_ADDRESS: "'$member_hostname'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member/configs/notification_config.js
sudo sed -ie 's/SENDGRID_API_KEY:.*,/SENDGRID_API_KEY: "'$sendgrid_api_key'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member/configs/notification_config.js


echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

echo -e '----------------------------------------'
echo -e 'APPLICATIONS SUCCESSFULLY SET UP!'
echo -e '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

###
## INSTALLING NODE MODULES
##-------------------------
###

appdir=$homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member

su -l $linux_admin_user -c 'cd '$appdir' && sudo npm install'

###
## RUNNING PRIMECHAIN-MONEY APPLICATION
##----------------------------------------
###

su -l $linux_admin_user -c 'cd '$appdir' && sudo pm2 start '$homedir'/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-member/kycMember.js'

su -l $linux_admin_user -c 'cd '$appdir' && sudo pm2 log 0'

echo -e '----------------------------------------'
echo -e 'APPLICATIONS RUNNING SUCCESSFULLY'
echo -e '----------------------------------------'
echo ''
echo ''
echo ''
echo ''
