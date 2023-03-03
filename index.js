const http = require("http");
const fs = require("fs");
const ImageNumbers = require("./numbers");

const db = JSON.parse(fs.readFileSync("db.json"));

const host = "0.0.0.0";
const port = 8080;

function generateSvg(number, params) {
  const defaultLength = params.get("default");
  const stringNumber = number.toString().padStart(defaultLength, "0");
  const numberWidth = 45;
  const margin = 5;
  const width =
    stringNumber.length * numberWidth + (stringNumber.length - 1) * margin;

  const numbers = stringNumber
    .split("")
    .map((number, i) => {
      const x = i * (numberWidth + margin);
      const image = ImageNumbers[+number];
      return `<image x="${x}" href="${image}" />`;
    })
    .join();

  return `<svg width="${width}" height="100" xmlns="http://www.w3.org/2000/svg">${numbers}</svg>`;
}

const requestListener = function (req, res) {
  let [user, params] = req.url.slice(1).split("?");
  user = user.toLowerCase();
  params = new URLSearchParams(params);

  if (!db[user]) db[user] = 0;
  const count = db[user]++;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader(
    "cache-control",
    "max-age=0, no-cache, no-store, must-revalidate"
  );
  res.writeHead(200);
  res.end(generateSvg(count, params));
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

setInterval(() => {
  fs.writeFileSync("db.json", JSON.stringify(db));
}, 1000 * 60);
