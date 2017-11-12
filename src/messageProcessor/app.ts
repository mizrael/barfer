import * as express from 'express';
import { Server } from 'http';
import * as path from 'path';

const app = express(),
    port = process.env.PORT || 3200,
    logsFullpath = path.join(__dirname, '..', '..', 'logs/log.txt');

app.route('/').get((req: express.Request, res: express.Response) => {
    res.sendFile(logsFullpath);
});

app.listen(port);

console.log('Message Processor Web UI started on: ' + port);