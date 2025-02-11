const { createServer } = require("node:http");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;

const server = createServer((req, res) => {
  //   let readThisContent = fs
  //     .readFileSync("./txt/read-this.txt", "utf8")
  //     .toString();
  //   let readInputContent = fs.readFileSync("./txt/input.txt", "utf8").toString();
  //   let readAppendContent = fs
  //     .readFileSync("./txt/append.txt", "utf8")
  //     .toString();
  //   let finalContent = readInputContent + readAppendContent;
  //   fs.writeFileSync("./txt/final.txt", finalContent);
  //   console.log(finalContent);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf8");
  if (req.url === "/") {
    res.end("<h1>Đây là trang chủ</h1>");
  } else if (req.url === "/overview") {
    res.end("<h1>Đây là trang overview </h1>");
  } else if (req.url === "/product") {
    res.end("<h1>Đây là trang sản phẩm </h1>");
  } else if (req.url.startsWith("/api")) {
    let urlArray = req.url.split("/");
    if (urlArray.length === 2) {
      let data = JSON.parse(fs.readFileSync("./dev-data/data.json"));
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    } else if (urlArray.length > 2) {
      let id = urlArray[urlArray.length - 1];
      let data = JSON.parse(fs.readFileSync("./dev-data/data.json"));
      let productData = data.find((item) => {
        return item.id === +id;
      });
      if (productData) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(productData));
      } else {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({}));
      }
    }
  } else {
    statusCode = 404;
    res.end("<h1>PAGE NOT FOUND</h1>");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
