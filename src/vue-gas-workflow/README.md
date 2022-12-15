# GitHub Pages リロード、直リンアクセス時の404対策

/docs/index.htmlのheadタグ内に以下を挿入
```html:index.html
<script>(function (l) {if (l.hash) {window.history.replaceState(null, null, l.hash.slice(1));}})(window.location);</script>
```

下記の内容で/docs/404.htmlを作成
```html:404.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 Not Found</title>
  <!-- GitHub Pages 404対策 -->
  <script>
    (function (l) {
      l.replace(l.origin + "/vue-gas-workflow/#" + l.pathname);
    })(window.location);
  </script>
</head>
<body>
  <h1>404 Not Found</h1>
</body>
</html>
```
