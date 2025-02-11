const { createServer } = require("node:http");
const url = require("url");
const fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;

// Đọc dữ liệu từ JSON
const readData = () => {
  return JSON.parse(fs.readFileSync("./dev-data/backup-data.json", "utf8"));
};

// Ghi dữ liệu vào JSON
const writeData = (data) => {
  fs.writeFileSync(
    "./dev-data/backup-data.json",
    JSON.stringify(data, null, 2)
  );
};

// Khởi tạo server
const server = createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === "/" || pathname === "/overview") {
    // Lấy danh sách sản phẩm
    let data = readData();
    let singleProductTemplate = fs.readFileSync(
      "./templates/single-product.html",
      "utf8"
    );

    let productListHTML = data.map((product) => {
      return singleProductTemplate
        .replaceAll("{{productName}}", product.productName)
        .replaceAll("{{quantity}}", product.quantity)
        .replaceAll("{{price}}", product.price)
        .replaceAll("{{image}}", product.image)
        .replaceAll("{{image1}}", product.image)
        .replaceAll("{{id}}", product.id);
    });

    let overviewTemplate = fs.readFileSync("./templates/overview.html", "utf8");
    overviewTemplate = overviewTemplate.replace(
      "{{content}}",
      productListHTML.join("")
    );

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(overviewTemplate);
  }

  // Trang tìm kiếm sản phẩm
  else if (pathname === "/search") {
    let searchTemplate = fs.readFileSync("./templates/search.html", "utf8");
    let searchKeyword = parsedUrl.query.q
      ? parsedUrl.query.q.toLowerCase()
      : "";

    if (searchKeyword) {
      let data = readData();
      let foundProduct = data.find((item) =>
        item.productName.toLowerCase().includes(searchKeyword)
      );

      if (foundProduct) {
        res.writeHead(302, { Location: `/product/${foundProduct.id}` });
        res.end();
      } else {
        searchTemplate = searchTemplate.replace(
          "🥦 Find your fruits 🌽",
          "NOT FOUND"
        );
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(searchTemplate);
      }
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(searchTemplate);
    }
  }

  // Hiển thị chi tiết sản phẩm
  else if (pathname.startsWith("/product")) {
    let productTemplate = fs.readFileSync("./templates/product.html", "utf8");
    let urlArray = pathname.split("/");
    let id = urlArray[urlArray.length - 1];

    let data = readData();
    let productData = data.find((item) => item.id === +id);

    if (productData) {
      let productHTML = productTemplate
        .replaceAll("{{organic}}", productData.organic)
        .replaceAll("{{nutrients}}", productData.nutrients)
        .replaceAll("{{from}}", productData.from)
        .replaceAll("{{productName}}", productData.productName)
        .replaceAll("{{quantity}}", productData.quantity)
        .replaceAll("{{price}}", productData.price)
        .replaceAll("{{image}}", productData.image)
        .replaceAll("{{description}}", productData.description);

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(productHTML);
    } else {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end("<h1>Product Not Found</h1>");
    }
  }

  // Trang tạo sản phẩm mới
  else if (pathname === "/create") {
    let createTemplate = fs.readFileSync("./templates/create.html", "utf8");

    if (req.method === "POST") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        let formData = new URLSearchParams(body);
        let newProduct = {
          id: Date.now(), // Tạo ID duy nhất
          productName: formData.get("productName") || "Unknown",
          image: formData.get("image") || "",
          from: formData.get("from") || "Unknown",
          nutrients: formData.get("nutrients") || "Unknown",
          quantity: +formData.get("quantity") || 0,
          price: formData.get("price") || "0",
          description: formData.get("description") || "",
          organic: formData.get("organic") === "on" ? "Yes" : "No",
        };

        let data = readData();
        data.push(newProduct);
        writeData(data);

        res.writeHead(302, { Location: `/product/${newProduct.id}` });
        res.end();
      });
    } else {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(createTemplate);
    }
  }

  // Xử lý đường dẫn không hợp lệ
  else {
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("<h1>PAGE NOT FOUND</h1>");
  }
});

// Lắng nghe server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
