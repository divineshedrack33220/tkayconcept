const express = require("express");
const next = require("next");
const path = require("path");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;

process.env.SKIP_LISTEN = "true";
const backendApp = require("./backend/src/server");

const nextApp = next({ dev, dir: path.join(__dirname, "frontend") });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();

  server.use(backendApp);

  server.all("*", (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(
      `> Ready on http://localhost:${port} [${dev ? "dev" : "prod"}]`
    );
  });
});
