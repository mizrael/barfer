import * as amqplib from 'amqplib';
import { MongoClient, ObjectId } from 'mongodb';
import { Commands } from '../common/infrastructure/entities/commands';
import { Queries } from '../common/infrastructure/entities/queries';
import { RepositoryFactory } from '../common/infrastructure/db';
import { CommandsDbContext, QueriesDbContext } from '../common/infrastructure/dbContext';
import { Publisher, Task } from '../common/services/publisher';
import * as request from 'request-promise';

const connStr = process.env.MONGO,
    repoFactory = new RepositoryFactory(),
    commandsDbContext = new CommandsDbContext(process.env.MONGO, repoFactory),
    queriesDbContext = new QueriesDbContext(process.env.MONGO, repoFactory),
    publisher = new Publisher(process.env.RABBIT);

function requestAccessToken() {
    let headers = { 'content-type': 'application/json' },
        options = {
            url: 'https://' + process.env.AUTH0_DOMAIN + '/oauth/token',
            method: 'POST',
            headers: headers,
            json: true,
            body: {
                audience: "https://mizrael.auth0.com/api/v2/",
                grant_type: 'client_credentials',
                client_id: 'gLxvdWo4jDcgld7l1rocJmSlJu5lbglt',
                client_secret: 'A8-KZ041ePuSakFODkUlNG7OOLjMFh-r0ZqIoIgF2VIr7eIuTG5bad00tkfcud0j'
            }
        };
    return request(options);
};

interface IUser {
    nickname: string;
    email: string;
    user_id: string;
    name: string;
};

function fetchUserProfile() {
    return requestAccessToken()
        .then(data => {
            let
                headers = {
                    'Authorization': 'Bearer ' + data['access_token']
                },
                options = {
                    url: "https://mizrael.auth0.com/api/v2/users",
                    method: 'GET',
                    headers: headers
                };
            return request(options).then(json => {
                let users = JSON.parse(json) as IUser[];
                return (users.length) ? users[0] : null;
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
};

function onBarfCreated(data) {
    let barfId = new ObjectId(data);

    return commandsDbContext.Barfs.then(repo => {
        repo.findOne({ _id: barfId }).then((barf: Commands.Barf) => {
            console.log("processing barf: " + JSON.stringify(barf));

            fetchUserProfile().then(user => {
                let barfDetails = new Queries.Barf(barf.id,
                    user.user_id,
                    user.nickname,
                    barf.text,
                    barf.creationDate);

                queriesDbContext.Barfs.then(repo => {
                    repo.insert(barfDetails).then(() => {
                        let task = new Task("barfs", "barf.ready", barfDetails);
                        publisher.publish(task);

                        console.log("barf details created: " + JSON.stringify(barfDetails));
                    });
                });
            });
        });
    });
};

function listenToBarfs() {
    const connStr = process.env.RABBIT,
        exchangeName = "barfs",
        queueName = "create-barfs",
        routingKey = "create.barf";
    amqplib.connect(connStr).then(conn => {
        conn.createChannel().then(ch => {
            ch.assertExchange(exchangeName, 'direct', { durable: false });
            //   ch.prefetch(1);
            ch.assertQueue(queueName, { exclusive: false }).then(q => {
                ch.bindQueue(q.queue, exchangeName, routingKey);
                ch.consume(q.queue, (msg: amqplib.Message) => {
                    let msgData = msg.content.toString(),
                        task = JSON.parse(msgData) as Task;

                    try {
                        onBarfCreated(task.data).catch((e) => {
                            console.log("an exception has occurred: " + JSON.stringify(e));
                        });
                    } catch (e) {
                        console.log("an exception has occurred: " + JSON.stringify(e));
                    }
                });
            });
        });
    });
};

listenToBarfs();

console.log("Barfs Processor running...");

