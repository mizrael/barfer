import * as amqplib from 'amqplib';

export class Task {
    constructor(public readonly context: string, public readonly type: string, public readonly data: any) { }
}

export interface IPublisher {
    publish<T>(task: Task);
}

export class Publisher implements IPublisher {
    constructor(private connStr: string) { }

    public publish<T>(task: Task) {
        let jsonData = JSON.stringify(task),
            buffer = new Buffer(jsonData);

        amqplib.connect(this.connStr).then(conn => {
            conn.createChannel().then(ch => {
                ch.assertExchange(task.context, 'direct', { durable: false });
                ch.publish(task.context, task.type, buffer, { persistent: false });

                setTimeout(function () { conn.close(); }, 500);
            });
        });
    }
}