import * as amqplib from 'amqplib';
import { Message } from './message';
import * as logger from './logger';

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
            exchange = await ch.assertExchange(options.exchangeName, 'direct', { durable: true }),
            queue = await ch.assertQueue(options.queueName, { exclusive: false });
        //ch.prefetch(1);

        ch.bindQueue(queue.queue, exchange.exchange, options.routingKey);
        ch.consume(queue.queue, (msg: amqplib.Message) => {
            if (!msg || !msg.content) {
                logger.warning("empty message received");
                return;
            }

            const msgData = msg.content.toString(),
                task = JSON.parse(msgData) as Message;

            logger.info("new message received on queue '" + queue.queue + "' : " + JSON.stringify(task));

            options.onMessage(task).then(() => {
                ch.ack(msg);
            }).catch(reason => {
                logger.error("task failed: " + JSON.stringify(reason));
            });
        }, { noAck: false });
    }
}