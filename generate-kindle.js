const fs = require("fs");

const books = JSON.parse(fs.readFileSync("books.json", "utf-8"));

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
