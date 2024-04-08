import express, { Express, Request, Response } from 'express';
import cors from 'cors'

declare global{
  namespace Express{
    interface Request{
      user_id: number
    }
  }
}

import { configure, network } from './network';
import { authHandler, getActiveRuntimes, getHistory, limitter, pingHandler, startHandler, stopHandler } from './services';
import { deleteCron } from './cron';
configure();
require('./db')


const app: Express = express();
const port = process.env.PORT;
app.use(cors({ origin: '*'}))

app.get('/',  async (req: Request, res: Response) => {
  res.send(`Server is up: System time is ${new Date()}`);
});

app.get('/start', authHandler, startHandler);
app.get('/ping', authHandler, pingHandler);
app.get('/stop', authHandler, stopHandler);
app.get('/history', limitter, getHistory)
app.get('/active', limitter, getActiveRuntimes)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  deleteCron.start();
});

