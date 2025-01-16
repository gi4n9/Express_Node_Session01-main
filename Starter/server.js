const http = require("http");
const fs = require("fs");
const path = require("path");

const hostname = "127.0.0.1";
const port = 3000;

const overviewHTML = fs.readFileSync("../templates/overview.html", "utf8");
const productHTML = fs.readFileSync("../templates/product.html", "utf8");

const data = JSON.parse(
  fs.readFileSync("../dev-data/backup-data.json", "utf8")
);

function replaceTemplate(template, data) {
  return template.replace(/{{(.*?)}}/g, (match, property) => {
    return data[property.trim()] || ""; //
  });
}

const server = http.createServer((req, res) => {
  const { url } = req;

  res.setHeader("Content-Type", "text/html");

  if (url === "/" || url === "/overview") {
    const updatedOverviewHTML = data
      .map((item) => replaceTemplate(overviewHTML, item))
      .join("");
    res.statusCode = 200;
    res.end(updatedOverviewHTML);
  } else if (url === "/product") {
    const updatedProductHTML = data
      .map((item) => replaceTemplate(productHTML, item))
      .join("");
    res.statusCode = 200;
    res.end(updatedProductHTML);
  } else if (url.startsWith("/product/")) {
    const productId = url.split("/")[2];
    const product = data.find((item) => item.id == productId);

    if (product) {
      const updatedProductDetailHTML = replaceTemplate(productHTML, product);
      res.statusCode = 200;
      res.end(updatedProductDetailHTML);
    } else {
      res.statusCode = 404;
      res.end("<h1>Product Not Found</h1>");
    }
  } else {
    res.statusCode = 404;
    res.end("<h1>Page Not Found</h1>");
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
