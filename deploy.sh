#!/bin/bash

echo "Deploying DocMatrix..."

git pull
npm install
npm run build
pm2 restart docmatrix
echo "Deployed DocMatrix successfully!"