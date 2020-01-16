#!/bin/bash
# create_keys.sh

cd $(dirname $0)

echo "Create keys for https (i.e. ssl) ..."
## create the key and certificate for ssl
openssl genrsa -out srv_wendy.key 2018
chmod a-w srv_wendy.key
chmod go-r srv_wendy.key
openssl req -new -x509 -nodes -sha256 -days 365 -key srv_wendy.key -out srv_wendy.crt

