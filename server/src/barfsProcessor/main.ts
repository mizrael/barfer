import * as amqplib from 'amqplib';
import { MongoClient, ObjectId } from 'mongodb';
import { Task } from '../common/services/publisher';
import { Barf } from '../common/infrastructure/entities/barf';

const connStr = process.env.MONGO,
    processors = {
        'barf_created': onBarfCreated
    };

function onBarfCreated(data): Promise<void> {
    console.log("onBarfCreated: " + data);

    let barfId = new ObjectId(data);
    return MongoClient.connect(connStr).then(db => {
        let coll = db.collection('barfs');
        coll.findOne({ _id: barfId }).then((barf: Barf) => {
            console.log("processing barf: " + JSON.stringify(barf));
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

