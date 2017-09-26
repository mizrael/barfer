import * as amqplib from 'amqplib';
import { MongoClient, ObjectId } from 'mongodb';
import { Task } from '../common/services/publisher';
import { Barf } from '../common/infrastructure/entities/barf';
import * as request from 'request-promise';

const connStr = process.env.MONGO,
    processors = {
        'barf_created': onBarfCreated
    };

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

function fetchUserProfile() {
    return requestAccessToken()
        .then(data => {
            console.log(data['access_token']);

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
                return json;
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
};

function onBarfCreated(data) {
    console.log("onBarfCreated: " + data);

    let barfId = new ObjectId(data);
    return MongoClient.connect(connStr).then(db => {
        let coll = db.collection('barfs');
        coll.findOne({ _id: barfId }).then((barf: Barf) => {
            console.log("processing barf: " + JSON.stringify(barf));
            fetchUserProfile().then(user => {
                console.log("user: " + JSON.stringify(user));
            });
        }).then(result => {
            db.close();
        });
    });
};

function listenToBarfs() {
    const connStr = process.env.RABBIT,
        queueName = "barfs";
    amqplib.connect(connStr).then(conn => {
        conn.createChannel().then(ch => {
            ch.assertQueue(queueName, { durable: true });
            ch.prefetch(1);

            ch.consume(queueName, (msg: amqplib.Message) => {
                let msgData = msg.content.toString(),
                    task = JSON.parse(msgData) as Task;

                console.log("received message: " + msgData);

                if (null == task || !task.name || '' == task.name) {
                    console.log("no task received, exiting.");
                    ch.ack(msg);
                    return;
                }

                try {
                    processors[task.name](task.data).then(() => {
                        ch.ack(msg);
                    }).catch((e) => {
                        console.log("aaaaan exception has occurred: " + JSON.stringify(e));
                        throw e;
                    });
                } catch (err) {
                    console.log(err);
                    // console.log("an exception has occurred: " + JSON.stringify(e));
                }
            }, { noAck: false });
        });
    });
};

listenToBarfs();

console.log("Barfs Processor running...");

