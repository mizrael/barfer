import * as amqplib from 'amqplib';
import { Message } from './message';

export interface IPublisher {
    publish(task: Message);
}

export class Publisher implements IPublisher {
    constructor(private connStr: string) { }

    public publish(task: Message) {
        let jsonData = JSON.stringify(task),
            buffer = new Buffer(jsonData);

        amqplib.connect(this.connStr).then(conn => {
            conn.createChannel().then(ch => {
                ch.assertExchange(task.exchangeName, 'direct', { durable: true });
                ch.publish(task.exchangeName, task.routingKey, buffer, { persistent: true });

                setTimeout(function () { conn.close(); }, 500);
            });
        });
    }
}