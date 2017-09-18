import * as amqplib from 'amqplib';

export class Task {
    constructor(public readonly name: string, public readonly data: any) { }
}

export interface IPublisher {
    publishTask<T>(queueName: string, task: Task);
}

export class Publisher implements IPublisher {
    constructor(private connStr: string) { }

    public publishTask<T>(queueName: string, task: Task) {
        let jsonData = JSON.stringify(task);

        amqplib.connect(this.connStr).then(conn => {
            conn.createChannel().then(ch => {
                ch.assertQueue(queueName, { durable: true });
                ch.sendToQueue(queueName, new Buffer(jsonData), { persistent: true });
                setTimeout(function () { conn.close(); }, 500);
            });
        });
    }
}