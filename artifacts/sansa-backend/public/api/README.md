# Apache / LiteSpeed `api/` folder

The original **Sansa Frontend.zip** shipped an `.htaccess` here with **Passenger and SetEnv lines**. Those files often contain **real API keys** and must **never** be committed to Git.

- On MilesWeb, configure environment variables in the **Node.js application** UI or SSH, not in a tracked `.htaccess`.
- If you need Apache-only rules without secrets, create `public/api/.htaccess` locally (it is gitignored in this repo).
