const fs = require("fs");

const booksDir = "./books";

const files = fs.readdirSync(booksDir);

const books = files
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f))
  .map(f => ({
    name: f,
    url: "/books/" + encodeURIComponent(f)
  }));

// 1️⃣ 写 books.json（保留）
fs.writeFileSync(
  "books.json",
  JSON.stringify(books, null, 2)
);

// 2️⃣ 生成 Kindle 兼容 index.html（关键）
let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Book Library</title>
</head>

<body>

<h1>Kindle Books Library</h1>
<hr>

<ul>
`;

for (const b of books) {
  const title = b.name.replace(/\.[^/.]+$/, "");

  html += `
  <li>
    <a href="${b.url}">
      ${title}
    </a>
  </li>
  `;
}

html += `
</ul>

<p style="font-size:12px;">
Kindle compatible page (no JavaScript)
</p>

</body>
</html>
`;

fs.writeFileSync("index.html", html);

console.log("books.json + index.html generated");
