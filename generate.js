const fs = require("fs");
const { execSync } = require("child_process");

const dir = "./books";

const files = fs.readdirSync(dir)
  .filter(f => /\.(epub|pdf|mobi|azw3)$/i.test(f));

function getTime(file) {
  try {
    // ⭐ 用最后一次 commit（比 A 更稳定）
    const ts = execSync(
      `git log -1 --format=%ct -- "${dir}/${file}"`
    ).toString().trim();

    return ts ? parseInt(ts) * 1000 : 0;
  } catch (e) {
    return 0;
  }
}

const books = files.map(f => {
  const ts = getTime(f);

  return {
    name: f,
    url: "/books/" + encodeURIComponent(f),
    ts
  };
});

// ⭐ 关键修复：稳定排序 + fallback
books.sort((a, b) => {
  if (a.ts === 0 && b.ts === 0) {
    return a.name.localeCompare(b.name);
  }
  return b.ts - a.ts;
});

// 写 JSON
fs.writeFileSync("books.json", JSON.stringify(books, null, 2));

// NEW 标记窗口
const NOW = Date.now();
const NEW_MS = 3 * 24 * 60 * 60 * 1000;

let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Books</title>
</head>
<body>

<h1>Books Library</h1>
<hr>

<ul>
`;

for (const b of books) {
  const title = b.name.replace(/\.[^/.]+$/, "");

  const isNew =
    b.ts > 0 && (NOW - b.ts < NEW_MS);

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
