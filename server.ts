import app from "./api/_app.js";
import { createServer as createViteServer } from "vite";

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TPmovies dev server running on port ${PORT}`);
  });
}

start();
