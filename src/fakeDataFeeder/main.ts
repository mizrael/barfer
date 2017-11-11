import * as uuid from 'uuid';
import { Subscriber, SubscriberOptions } from '../common/services/subscriber';

import { Publisher } from '../common/services/publisher';
import { RepositoryFactory, DbFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';
import { Queries } from '../common/infrastructure/entities/queries';

function initFakeData() {
    var fs = require("fs"),
        path = require("path");

    var filename = path.join(__dirname, "/data/mockDataLight.db"),
        content = fs.readFileSync(filename),
        users = JSON.parse(content);

    let dbFactory = new DbFactory(),
        repoFactory = new RepositoryFactory(dbFactory),
        queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory);

    console.log("creating " + users.length + " users...");

    for (var i = 0; i != users.length; ++i) {
        let user = users[i],
            userDetails: Queries.User = {
                email: user.email,
                name: user.name,
                nickname: user.nickname,
                picture: user.picture,
                userId: user.userId,
                barfsCount: user.barfs.length,
            };
        queriesDbContext.Users.then(repo => repo.insert(userDetails)).then(() => {
            console.log("created user: " + JSON.stringify(userDetails));

            for (var b = 0; b != user.barfs.length; ++b) {
                let barf = user.barfs[b],
                    creationDate = Date.now(),
                    barfDetails: Queries.Barf = {
                        id: uuid.v4(),
                        userId: userDetails.userId,
                        userName: userDetails.nickname,
                        text: barf.text,
                        creationDate: Date.now()
                    };

                queriesDbContext.Barfs.then(repo => {
                    repo.insert(barfDetails).then(() => {
                        console.log("barf created: " + JSON.stringify(barfDetails));
                    });
                });
            }
        });
    }
};
initFakeData();

