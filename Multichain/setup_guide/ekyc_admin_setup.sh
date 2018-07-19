#!/bin/bash

source config.conf

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
sudo apt-get --assume-yes install jq

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

su -l $linux_admin_user -c  'multichain-util create '$chainname $protocol

su -l $linux_admin_user -c "sed -ie 's/.*root-stream-open =.*\#/root-stream-open = false     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*mining-requires-peers =.*\#/mining-requires-peers = true     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*maximum-block-size =.*\#/maximum-block-size = 1000000000     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*initial-block-reward =.*\#/initial-block-reward = 0     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*first-block-reward =.*\#/first-block-reward = -1     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*target-adjust-freq =.*\#/target-adjust-freq = -1     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*max-std-tx-size =.*\#/max-std-tx-size = 100000000     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*max-std-op-returns-count =.*\#/max-std-op-returns-count = 1024     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*max-std-op-return-size =.*\#/max-std-op-return-size = 67108864     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*max-std-op-drops-count =.*\#/max-std-op-drops-count = 100     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*max-std-element-size =.*\#/max-std-element-size = 32768     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*default-network-port =.*\#/default-network-port = '$networkport'     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*default-rpc-port =.*\#/default-rpc-port = '$rpcport'     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c "sed -ie 's/.*chain-name =.*\#/chain-name = '$chainname'     #/g' $homedir/.multichain/$chainname/params.dat"
su -l $linux_admin_user -c " sed -ie 's/.*protocol-version =.*\#/protocol-version = '$protocol'     #/g' $homedir/.multichain/$chainname/params.dat"

su -l $linux_admin_user -c "echo rpcuser=$rpcuser > $homedir/.multichain/$chainname/multichain.conf"
su -l $linux_admin_user -c "echo rpcpassword=$rpcpassword >> $homedir/.multichain/$chainname/multichain.conf"
su -l $linux_admin_user -c 'echo rpcport='$rpcport' >> '$homedir'/.multichain/'$chainname'/multichain.conf'
su -l $linux_admin_user -c 'echo rpcallowip='10.0.0.0/255.0.0.0' >> '$homedir'/.multichain/'$chainname'/multichain.conf'

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

echo '----------------------------------------'
echo -e 'RUNNING BLOCKCHAIN.....'
echo '----------------------------------------'

su -l $linux_admin_user -c 'multichaind '$chainname' -daemon'

echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

echo '----------------------------------------'
echo -e 'LOADING CONFIGURATION.....'
echo '----------------------------------------'

sleep 6

addr=`curl --user $rpcuser:$rpcpassword --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getaddresses", "params": [] }' -H 'content-type: text/json;' http://127.0.0.1:$rpcport | jq -r '.result[0]'`


echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''


echo '----------------------------------------'
echo -e 'CREATING AND CONFIGURING STREAMS.....'
echo '----------------------------------------'

su -l $linux_admin_user -c  "multichain-cli "$chainname" createrawsendfrom "$addr" '{}' '[{\"create\":\"stream\",\"name\":\"KYC_MEMBER_MASTERLIST_STREAM\",\"open\":false,\"details\":{\"purpose\":\"Stores the member details\"}}]' send"
su -l $linux_admin_user -c  "multichain-cli "$chainname" createrawsendfrom "$addr" '{}' '[{\"create\":\"stream\",\"name\":\"KYC_DATA_STREAM\",\"open\":false,\"details\":{\"purpose\":\"Stores the unencrypted form details\"}}]' send"
su -l $linux_admin_user -c  "multichain-cli "$chainname" createrawsendfrom "$addr" '{}' '[{\"create\":\"stream\",\"name\":\"KYC_RECORD_STREAM\",\"open\":false,\"details\":{\"purpose\":\"Stores the encrypted document details\"}}]' send"
su -l $linux_admin_user -c  "multichain-cli "$chainname" createrawsendfrom "$addr" '{}' '[{\"create\":\"stream\",\"name\":\"KYC_OTHER_STREAM\",\"open\":false,\"details\":{\"purpose\":\"Stores the document category details\"}}]' send"
su -l $linux_admin_user -c  "multichain-cli "$chainname" createrawsendfrom "$addr" '{}' '[{\"create\":\"stream\",\"name\":\"KYC_SIGNATURE_STREAM\",\"open\":false,\"details\":{\"purpose\":\"Stores the signature details\"}}]' send"


# SUBSCRIBE STREAMS
# --------- -------

su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_MEMBER_MASTERLIST_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_DATA_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_RECORD_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_OTHER_STREAM"
su -l $linux_admin_user -c  "multichain-cli "$chainname" subscribe KYC_SIGNATURE_STREAM"


# STORING KYC CATEGORIES INTO KYC_OTHER_STREAM
#-------- -------- -------- ---- -----------------------
su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM kyc_code_categories 7b2231303030223a22426173696320696e666f726d6174696f6e2026207265636f726473222c2231303530223a2241646472657373657320616e6420636f6e7461637420696e666f726d6174696f6e222c2231323530223a22526567697374726174696f6e20446f63756d656e7473284e6f6e202d2074617829222c2231343030223a2250726f66657373696f6e616c206669726d73222c2232303030223a2246696e616e6369616c20496e666f726d6174696f6e222c2232313030223a225461782072656c61746564207265636f726473227d"


# STORING KYC SUB CATEGORIES INTO KYC_OTHER_STREAM
#-------- -------- -------- ---- ---------------
su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM 1000 7b223130303031303130223a224365727469666963617465206f6620696e636f72706f726174696f6e222c223130303031303230223a224d656d6f72616e64756d206f66204173736f63696174696f6e222c223130303031303235223a22416d656e646d656e747320746f204d656d6f72616e64756d206f66204173736f63696174696f6e222c223130303031303330223a2241727469636c6573206f66204173736f63696174696f6e222c223130303031303335223a22416d656e646d656e747320746f2041727469636c6573206f66204173736f63696174696f6e222c223130303031303430223a2242792d6c617773222c223130303031303435223a22416d656e646d656e747320746f2062792d6c617773222c223130303031303530223a224d696e75746573206f66206d656574696e6773222c223130303031303630223a224f7267616e697a6174696f6e616c206368617274222c223130303031303730223a224365727469666963617465206f6620476f6f64205374616e64696e67222c223130303031303830223a2241637469766520737461747573207265706f72747320696e20746865207374617465202f20636f756e747279206f6620696e636f72706f726174696f6e222c223130303031303930223a22417373756d6564206e616d6520616e6420636f7079206f6620726567697374726174696f6e73222c223130303031313030223a224c697374206f66207374617465732c2070726f76696e6365732c20636f756e74726965732077686572652074686520656e7469747920697320617574686f72697a656420746f20646f20627573696e657373222c223130303031313130223a2244657461696c73206f66207368617265686f6c64657273227d"

su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM 1050 7b223130353031303130223a225574696c6974792062696c6c222c223130353031303230223a2252656e74616c206f72204c656173652041677265656d656e74222c223130353031303330223a225363686564756c65206f6620627573696e657373206c6f636174696f6e73227d"

su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM 1250 7b223132353031303130223a22496d706f7274204578706f7274206c6963656e7365222c223132353031303230223a224d756e69636970616c206c6963656e7365222c223132353031303330223a225472616465202f20436f6d6d65726369616c206c6963656e7365227d"

su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM 1400 7b223134303031303130223a2244657461696c73206f66206c6177206669726d7320656e67616765642062792074686520656e74697479222c223134303031303230223a2244657461696c73206f66206163636f756e74696e67206669726d7320656e67616765642062792074686520656e74697479222c223134303031303330223a2244657461696c73206f6620636f6e73756c74696e67206669726d7320656e67616765642062792074686520656e74697479222c223134303031303430223a2244657461696c73206f66206f746865722070726f66657373696f6e616c7320656e67616765642062792074686520656e74697479227d"


su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM 2000 7b223230303031303130223a22417564697465642066696e616e6369616c2073746174656d656e7473222c223230303031303230223a2241756469746f722773205265706f727473222c223230303031303235223a22416e616c79736973206f6620666978656420616e64207661726961626c6520657870656e736573222c223230303031303430223a22556e617564697465642073746174656d656e7473222c223230303031303530223a2250726f6a656374696f6e732c206361706974616c20627564676574732c2073747261746567696320706c616e73222c223230303031303630223a22416e616c797374207265706f727473222c223230303031303730223a225363686564756c65206f6620636f6e74696e67656e74206c696162696c6974696573222c223230303031303830223a22496e76656e746f72792c206163636f756e74732072656365697661626c652c206163636f756e74732070617961626c65222c223230303031303930223a224465736372697074696f6e206f6620646570726563696174696f6e20616e6420616d6f7274697a6174696f6e206d6574686f6473222c223230303031313030223a224368616e67657320696e206163636f756e74696e67206d6574686f6473222c223230303031313130223a22416e616c79736973206f662067726f7373206d617267696e73222c223230303031313230223a2247656e6572616c206c6564676572222c223230303031313330223a22496e7465726e616c20636f6e74726f6c2070726f63656475726573227d"


su -l  $linux_admin_user -c  "multichain-cli "$chainname" publish KYC_OTHER_STREAM 2100 7b223231303031303130223a22496e636f6d65207461782066696c696e6773222c223231303031303230223a2253616c6573207461782066696c696e6773222c223231303031303330223a2254617820736574746c656d656e74207265636f726473222c223231303031303430223a22456d706c6f796d656e74207461782066696c696e6773222c223231303031303530223a22457863697365207461782066696c696e6773222c223231303031303630223a224753542066696c696e6773222c223231303031303730223a225641542066696c696e6773222c223231303031303830223a224f74686572207461782066696c696e6773222c223231303031303930223a22546178206c69656e73227d"


echo ''
echo ''
echo '----------------------------------------'
echo ''
echo ''
echo ''
echo ''

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
## INSTALLING & CONFIGURING Primechain-KYC-ADMIN
#-----------------------------------------------------
###
su -l $linux_admin_user -c 'cd ~/primechain-products && git clone https://github.com/Primechain/primechain-ekyc-open-source.git'

# Configuring Primechain-KYC-ADMIN
# ----------- --------------------------
sudo sed -ie 's/RPC_PORT:.*,/RPC_PORT: "'$rpcport'",/g' $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin/configs/blockchain_config.js
sudo sed -ie 's/RPC_USER:.*,/RPC_USER: "'$rpcuser'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin/configs/blockchain_config.js
sudo sed -ie 's/RPC_PASSWORD:.*,/RPC_PASSWORD: "'$rpcpassword'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin/configs/blockchain_config.js
sudo sed -ie 's/IP_ADDRESS:.*,/IP_ADDRESS: "'$admin_hostname'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin/configs/notification_config.js
sudo sed -ie 's/SENDGRID_API_KEY:.*,/SENDGRID_API_KEY: "'$sendgrid_api_key'",/g'  $homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin/configs/notification_config.js


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
##----------------------------
###

appdir=$homedir/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin

su -l $linux_admin_user -c 'cd '$appdir' && sudo npm install'

###
## RUNNING PRIMECHAIN-KYC-ADMIN APPLICATION
##----------------------------------------------
###

su -l $linux_admin_user -c 'cd '$appdir' && sudo pm2 start '$homedir'/primechain-products/primechain-ekyc-open-source/Multichain/primechain-kyc-admin/kycAdmin.js'

su -l $linux_admin_user -c 'cd '$appdir' && sudo pm2 log 0'

echo -e '----------------------------------------'
echo -e 'APPLICATIONS RUNNING SUCCESSFULLY'
echo -e '----------------------------------------'
echo ''
echo ''
echo ''
echo ''








