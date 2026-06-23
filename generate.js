const fs = require("fs");
const { execSync } = require("child_process");

const dir = "./books";

const files = fs.readdirSync(dir)
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f));

function getTime(file) {
  try {
    const ts = execSync(
      `git log -1 --format=%ct -- "${dir}/${file}"`
    ).toString().trim();

    return ts ? parseInt(ts) * 1000 : 0;
  } catch (e) {
    return 0;
  }
}

// 1️⃣ 构建书籍数据
const books = files.map(f => {
  const ts = getTime(f);

  return {
    name: f,
    url: "/books/" + encodeURIComponent(f),
    ts
  };
});

// 2️⃣ 排序（旧 → 新 or 新 → 旧你可改）
// 👉 这里示例：新在下（旧在上）
// books.sort((a, b) => a.ts - b.ts);

// 👉 这里示例：旧在下（新在上）
books.sort((a, b) => b.ts - a.ts);

// 3️⃣ 写 books.json（备用）
fs.writeFileSync("books.json", JSON.stringify(books, null, 2));

// 4️⃣ 生成 Kindle 兼容 index.html（核心）
const NOW = Date.now();
const NEW_MS = 3 * 24 * 60 * 60 * 1000;


const style = `
<style>
body {
  font-size: 20px;
  line-height: 1.8;
}
li { margin: 10px 0; }
</style>
`;

let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Book Library</title>
${style}
</head>
<body>

<h1>📚 Book Library</h1>
<hr>
<ol>
`;


books.forEach((b, index) => {

  const title = b.name.replace(/\.[^/.]+$/, "");

  const isNew =
    b.ts > 0 && (NOW - b.ts < NEW_MS);

  html += `
  <li>
    <a href="${b.url}">
      ${title}
    </a>
    ${isNew ? "🆕" : ""}
  </li>
  `;
});

html += `
</ol>

<hr>

<p style="font-size:12px;">
Kindle compatible · generated at build time · no JS
</p>

</body>
</html>
`;

fs.writeFileSync("index.html", html);

console.log("OK: index.html generated for Kindle");
