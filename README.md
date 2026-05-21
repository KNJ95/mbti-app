# クイックMBTI診断

5分で完了するMBTI簡易診断アプリ。社内研修・イベント向け。

- 全16問・2択式・5分以内に完了
- 4軸(E/I・S/N・T/F・J/P)から16タイプを判定
- 結果はタイプ名と一言説明のみのシンプル構成
- スマホ/PC対応(レスポンシブ)
- ビルド不要のピュアHTML/CSS/JavaScript

## ディレクトリ構成

```
.
├── index.html          # エントリーポイント
├── css/
│   └── styles.css      # スタイル
├── js/
│   ├── main.js         # アプリ制御(エントリ)
│   ├── questions.js    # 質問データ
│   └── types.js        # 16タイプの説明
├── vercel.json         # Vercel設定
├── package.json
├── .gitignore
└── README.md
```

## ローカルで動かす

ES Modules を使っているため、`file://` で直接開くと動きません。簡易サーバーで起動してください。

```bash
# npm経由
npm start

# あるいは Python があるなら
python3 -m http.server 3000
```

ブラウザで `http://localhost:3000` を開きます。

## GitHubで管理する

```bash
cd mbti-app
git init
git add .
git commit -m "Initial commit: MBTI quick diagnosis app"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Vercelにデプロイする

### 方法1: GitHub連携(推奨)

1. [vercel.com](https://vercel.com) にログイン
2. 「Add New...」→「Project」
3. 上記でpushしたGitHubリポジトリをImport
4. Framework Preset は「Other」のままでOK(静的サイトとして検出されます)
5. 「Deploy」をクリック

push するたびに自動でデプロイされます。

### 方法2: Vercel CLI

```bash
npm i -g vercel
vercel        # 初回:対話で設定
vercel --prod # 本番デプロイ
```

## カスタマイズ

### 質問を変更する

`js/questions.js` を編集。各質問は次の形式です。

```javascript
{
  axis: 'EI', // 'EI' | 'SN' | 'TF' | 'JP'
  text: '質問文',
  a: { text: '選択肢A', type: 'E' },
  b: { text: '選択肢B', type: 'I' },
}
```

質問数を増減してもロジックはそのまま動きます(同数の場合は左側=E/S/T/Jを優先する仕様)。

### タイプ説明を変更する

`js/types.js` で `nickname`(ニックネーム)と `desc`(一言説明)を編集してください。

### 配色・フォントを変更する

`css/styles.css` の冒頭にある `:root` のCSS変数を変更します。

```css
:root {
  --bg: #f4ede1;       /* 背景色 */
  --ink: #1a2238;      /* メインテキスト */
  --accent: #c2410c;   /* アクセントカラー */
  /* ... */
}
```

## ライセンス

MIT
