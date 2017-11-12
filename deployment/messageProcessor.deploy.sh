gulp
rm -rf ./node_modules
rm -rf ./tests
rm -rf ./src
rm -rf ./bin/fakeDataFeeder
rm -rf ./bin/barfsService
rm -rf ./bin/usersService
rm -rf ./bin/web
rm ./package.json
mv ./bin/messageProcessor/app_data ./app_data
mv ./deployment/package.messageProcessor.json ./package.json