import * as amqplib from 'amqplib';
import { Message } from './message';

export class SubscriberOptions {
    constructor(public readonly exchangeName: string,
        public readonly queueName: string,
        public readonly routingKey: string,
        public readonly onMessage: (t: Message) => Promise<void>) { }
}

export interface ISubscriber {
    register(options: SubscriberOptions);
}

export class Subscriber implements ISubscriber {
    constructor(private connStr: string) { }

    public async register(options: SubscriberOptions) {
        let conn = await amqplib.connect(this.connStr),
            ch = await conn.createChannel(),
            exchange = await ch.assertExchange(options.exchangeName, 'topic', { durable: true }),
            queue = await ch.assertQueue(options.queueName, { exclusive: false });
        //ch.prefetch(1);

        ch.bindQueue(queue.queue, exchange.exchange, options.routingKey);
        ch.consume(queue.queue, (msg: amqplib.Message) => {
            if (!msg || !msg.content) {
                console.log("empty message received");
                return;
            }

            let msgData = msg.content.toString(),
                task = JSON.parse(msgData) as Message;

            options.onMessage(task).then(() => {
                ch.ack(msg);
            }).catch(reason => {
                console.log("task failed: " + JSON.stringify(reason));
            });
        }, { noAck: false });
    }
}