import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: `Server is running on port ${PORT}`,
    environment: config.nodeEnv,
    port: PORT,
  }));
});
