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
const httpServer = new Server(app);

const port = process.env.PORT;
app.use(cors({ origin: ['http://192.168.101.50:5173', 'http://192.168.101.11:5173'],credentials: true}))

app.get('/',  async (req: Request, res: Response) => {
  res.send(`Server is up: System time is ${new Date()}`);
});

// app.get('/start', authHandler, startHandler);
// app.get('/ping', authHandler, pingHandler);
// app.get('/stop', authHandler, stopHandler);
app.get('/history', limitter, getHistory)
app.get('/active', limitter, getActiveRuntimes)

const ws = new WebSocketServer({server: httpServer});

ws.on("connection", socket=>{

  console.log('comeone connected')

  socket.on('message', ms=>{
    try{
      const message = ms.toString();
      const converted = JSON.parse(message);
      let user_id = null
      switch(converted.event){
        case "start": 
          user_id = authHandler(converted.data);
          if(user_id !==null ) startHandler(user_id)
        break;
        case "pingg":
          user_id = authHandler(converted.data);
          if(user_id !==null ) pingHandler(user_id)
        break;
        case "stop": 
          user_id = authHandler(converted.data);
          if(user_id !==null ) stopHandler(user_id)
        break;
      }
    }
    catch(e){
      console.log(e)
    }
  })
  
})


httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  deleteCron.start();
});

