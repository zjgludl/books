const fs = require("fs");
const { execSync } = require("child_process");

const booksDir = "./books";

// 读取文件
const files = fs.readdirSync(booksDir)
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f));

// 构建书籍数据
const books = files.map(f => {
  const path = `books/${f}`;

  let ts = 0;

  try {
    // ⭐ 获取 git 最后提交时间（秒）
    const out = execSync(
      `git log -1 --format=%ct -- "${path}"`
    ).toString().trim();

    ts = parseInt(out) * 1000;
  } catch (e) {
    ts = 0;
  }

  return {
    name: f,
    url: "/books/" + encodeURIComponent(f),
    ts
  };
});

// ⭐ 按时间排序（最新在前）
books.sort((a, b) => b.ts - a.ts);

// ==========================
// 1️⃣ 生成 books.json
// ==========================
fs.writeFileSync(
  "books.json",
  JSON.stringify(books, null, 2)
);

// ==========================
// 2️⃣ 生成 index.html（Kindle兼容）
// ==========================

const NOW = Date.now();
const NEW_THRESHOLD = 3 * 24 * 60 * 60 * 1000; // 3天

let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Book Library</title>
</head>

<body>

<h1>📚 Books Library</h1>
<hr>

<ul>
`;

for (const b of books) {
  const title = b.name.replace(/\.[^/.]+$/, "");

  const isNew = (NOW - b.ts) < NEW_THRESHOLD;

  html += `
  <li>
    <a href="${b.url}">
      ${title}
    </a>
    ${isNew ? "🆕" : ""}
  </li>
  `;
}

html += `
</ul>

<hr>

<p style="font-size:12px;">
Kindle compatible page · sorted by latest commit time
</p>

</body>
</html>
`;

fs.writeFileSync("index.html", html);

console.log("✅ books.json + index.html generated");
