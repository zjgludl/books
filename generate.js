const fs = require("fs");
const path = require("path");

const booksDir = "./books";

const files = fs.readdirSync(booksDir);

const books = files
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f))
  .map(f => ({
    name: f,
    url: "/books/" + encodeURIComponent(f)
  }));

// 1️⃣ 写 books.json
fs.writeFileSync(
  "books.json",
  JSON.stringify(books, null, 2)
);

// 2️⃣ 生成 Kindle HTML（静态版）
let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Kindle Library</title>
</head>
<body>

<h1>📚 Kindle Books</h1>
<hr>
<ul>
`;

for (const b of books) {
  html += `
  <li>
    <a href="${b.url}">
      ${b.name}
    </a>
  </li>
  `;
}

html += `
</ul>
</body>
</html>
`;

fs.writeFileSync("kindle.html", html);

console.log("books.json + kindle.html generated");
