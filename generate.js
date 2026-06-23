const fs = require("fs");
const { execSync } = require("child_process");

// 1️⃣ 获取所有书籍文件
const files = fs.readdirSync("./books")
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f));

// 2️⃣ 用 git log 一次性获取“添加时间”
const log = execSync(
  `git log --diff-filter=A --pretty=format:"%ct %H %f" -- books/`
).toString().trim().split("\n");

// 3️⃣ 构建 file → time 映射（关键）
const timeMap = {};

for (const line of log) {
  const [ts, hash, ...nameParts] = line.split(" ");
  const name = nameParts.join(" ");
  timeMap[name] = parseInt(ts) * 1000;
}

// 4️⃣ 组装 books
const books = files.map(f => {
  return {
    name: f,
    url: "/books/" + encodeURIComponent(f),
    ts: timeMap[f] || 0
  };
});

// 5️⃣ ⭐ 按时间排序（核心修复）
books.sort((a, b) => b.ts - a.ts);

// 6️⃣ 写 books.json
fs.writeFileSync("books.json", JSON.stringify(books, null, 2));

// 7️⃣ 生成 index.html（Kindle版）
const NOW = Date.now();
const NEW_THRESHOLD = 3 * 24 * 60 * 60 * 1000;

let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Books Library</title>
</head>
<body>

<h1>Kindle Books Library</h1>
<hr>

<ul>
`;

for (const b of books) {
  const title = b.name.replace(/\.[^/.]+$/, "");
  const isNew = NOW - b.ts < NEW_THRESHOLD;

  html += `
  <li>
    <a href="${b.url}">${title}</a>
    ${isNew ? "🆕" : ""}
  </li>
  `;
}

html += `
</ul>

</body>
</html>
`;

fs.writeFileSync("index.html", html);

console.log("OK");
