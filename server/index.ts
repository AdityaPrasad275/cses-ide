import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the server!');
});

app.post('/api/code', (req: Request, res: Response) => {
  const { code } = req.body;
  console.log('Received code:', code);
  // In the future, you will compile and run the code here.
  res.json({ message: 'Code received successfully!' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
