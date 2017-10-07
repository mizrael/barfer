import * as amqplib from 'amqplib';
import { Task } from './task';

export interface IPublisher {
    publish(task: Task);
}

export class Publisher implements IPublisher {
    constructor(private connStr: string) { }

    public publish(task: Task) {
        let jsonData = JSON.stringify(task),
            buffer = new Buffer(jsonData);

        amqplib.connect(this.connStr).then(conn => {
            conn.createChannel().then(ch => {
                ch.assertExchange(task.context, 'direct', { durable: true });
                ch.publish(task.context, task.type, buffer, { persistent: true });

                setTimeout(function () { conn.close(); }, 500);
            });
        });
    }
}