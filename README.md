# 鈴木 駿介 | 電子名刺 Webサイト

交流会などで出会った方に、ITインフラの技術力と、企画を周囲と協力して実現する姿勢を伝える個人の電子名刺です。

## 公開URL
- [電子名刺トップ](https://electronic-business-card.pages.dev/)
- [Network Infrastructure Lab](https://electronic-business-card.pages.dev/portfolio/network-infrastructure-lab/)
- [eスポーツ大会の企画・統括](https://electronic-business-card.pages.dev/projects/esports-tournament/)

## 現在の状態（2026-10-18）
- Cloudflare Pages の公開サイトと GitHub main を連携して運用しています。
- 自己紹介、顔写真、Instagram へのリンクを掲載しています。
- **企画実績**：2024年、日本電子専門学校スポーツフェスティバルのeスポーツ大会を学生側で統括。参加者30名弱、運営約8名は本人の記憶に基づく概数です。
- **技術実績**：独立設計のPacket Tracerラボの .pkt ファイル、検証画像10枚、必須試験9件・障害演習3件の記録を公開しています。これは**Cisco Packet Tracer上の利用者実測**であり、実機試験・第三者の独立再実行は未実施です。
- 一部の設計書とCLIは**作成当時の旧案**です。現行の結果は[実測記録](portfolio/network-infrastructure-lab/docs/verification-results.md)、詳細設計は[design-v1.md](portfolio/network-infrastructure-lab/docs/design-v1.md)をご確認ください。

## 主なディレクトリ
- `index.html`：電子名刺トップ
- `projects/esports-tournament/index.html`：企画・実行のケーススタディ
- `portfolio/network-infrastructure-lab/index.html`：ネットワーク技術のポートフォリオ
- `portfolio/network-infrastructure-lab/docs/`：技術設計、検証手順、実測記録
- `portfolio/network-infrastructure-lab/assets/`：Packet Tracer構築ファイルと検証画像
- `assets/`：favicon とSNS共有用画像

## 運用・公開ポリシー
- 静的HTML/CSSで構成。GitHub main にマージすると、Cloudflare PagesのGit連携設定に従い自動デプロイされます。
- 公開前に勤務先・顧客の内部資料、機密情報、第三者の写真・著作権について点検してください。
- **個人LINEのID・追加URL・QRコードは公開しません**。LINEは対面のみで交換する方針です。
- 変更は改善用ブランチ → Pull Request → 内容・表示検証 → main マージの順に進めます。
