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

const books = files.map(f => {
  const ts = getTime(f);

  return {
    name: f,
    url: "/books/" + encodeURIComponent(f),
    ts
  };
});

//
// ⭐ 关键修改：旧 → 新（升序）
//
books.sort((a, b) => b.ts - a.ts );

// 写 books.json
fs.writeFileSync("books.json", JSON.stringify(books, null, 2));

// NEW 标记（只对“新书”有效）
const NOW = Date.now();
const NEW_MS = 3 * 24 * 60 * 60 * 1000;

let html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Books Library</title>
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
