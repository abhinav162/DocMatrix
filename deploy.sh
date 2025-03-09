#!/bin/bash

echo "Deploying DocMatrix..."

git pull
npm install
npm run db:init
npm run build
pm2 restart docmatrix
echo "Deployed DocMatrix successfully!"