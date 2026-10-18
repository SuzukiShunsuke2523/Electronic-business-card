# Network Infrastructure Lab 品質レビュー — 2026-10-18

## 結論と評価範囲

現状は基本的な構築・検証を示す学習ポートフォリオとして公開可能。ただし、資料の版混在と証跡の追跡性が信頼を損ねていた。改善後も「第三者が独立再現し、全設定・全試験を確認した完成品」とは判断しない。

対象main: `f3b15a6439ff44d04828f795a50850c89f1b3640`。
公開Labと電子名刺を実ブラウザーのDOMで確認し、GitHubの全13テキストファイルとPNG10枚を確認した。公開ギャラリー10枚の画像読み込み・寸法をDOMで確認。T01画像へのEnter操作による原寸表示と戻る操作を確認した。

.pktをGitHub APIから取得し、78,787 bytesという登録情報とSHA-256 `10b05b7a425cd3c7c4e052d49e1239f0eb86951f1a143eb70496ead9fba36186`（既存一覧との一致）を確認。Packet Tracerで開く操作、内部設定の解析、保存後の再実行は未実施。

## 採点（各100点・6領域を等重み）

採点は本レビューの専門判断であり認証ではない。改善後はPRのソースを対象とした暫定値で、本番公開後の評価ではない。C/Eは画面キャプチャ・厳密なモバイル検証が完了していないため暫定。

| 領域 | 変更前 | 改善案 | 主な理由 |
|---|---:|---:|---|
| A 技術的正確性 | 70 | 84 | 旧案との矛盾、状態表示、ACL許可範囲の説明を修正。保存設定の原本照合は未完了 |
| B 技術力の伝わりやすさ | 62 | 76 | 設計判断・担当範囲・試験IDと証跡の対応を明示。生ログ不足が残る |
| C Web/UI/UX | 72 | 76 | 目次・構成図拡大を追加。実画面の最終確認は未完了 |
| D ブランディング | 68 | 82 | 「利用者」など第三者視点の表現を整理、誇張を避けて作者と検証範囲を明示 |
| E 情報設計/SEO/アクセシビリティ | 68 | 82 | canonical/OG、スキップリンク、focus-visible、表のcaption/scopeを追加 |
| F セキュリティ/公開品質 | 73 | 80 | 資料の入口と再現手順を整理、証跡原本を保全。バイナリ内の個人情報は未確認 |
| **総合（平均・四捨五入）** | **69** | **80** | 改善案に対する暫定評価 |

## 指摘・根拠・対応

Critical: 調査できた範囲では確認していない。未確認の.pkt内部まで安全と保証するものではない。

| ID | 重要度 | 該当箇所・根拠 | 対応 |
|---|---|---|---|
| Q01 | High | DESIGN.mdは1941/3端末/社員WEB Ping拒否、docs/design-v1.mdは2911/4端末/Ping許可。proposed-cli.txtも旧ACL名 | 旧資料本文を保存し、先頭に履歴・使用禁止と現行リンクを追加 |
| Q02 | High | docs/packet-tracer-v1.mdの「シミュレーターでまだ動かしていません」が公開ページと矛盾。review-v1.mdも時点が曖昧 | 作者の試験と参照CLI全行の未照合を分離。旧レビューに時点を明記 |
| Q03 | High | verification-results.mdはshow結果と累積カウンタを要約するだけで原文なし。T04/T06/T07/T08/T10・障害②の専用画像なし | 試験別証跡表と不足を明記。原本の追加は未対応 |
| Q04 | Medium | FROM_SERVERのTCP行に送信元ポート80がない。ACK/RST付きTCPを許可し、HTTP応答限定ではない | ACL・.pktを変えず文書とページに実際の許可範囲を追記 |
| Q05 | Medium | SW1にnative 999、R1にはnative 999サブIFなし。公開ページではこの制約が読めない | VLAN999のL3疎通を提供しない旨を明示 |
| Q06 | Medium | 構成図は縮小imgのみで拡大リンクなし。試験表は9件を7行に集約しIDなし | SVGリンク追加、T01〜T08/T10を9行化、画像へのリンク追加 |
| Q07 | Medium | 本人のサイトで「利用者」「公開元」の主体が混在、設計の理由が弱い | 作者の実施範囲、構成選択の意味を明記。設計時の思考過程は捏造しない |
| Q08 | Medium | Labにスキップ導線・明示focusスタイル・表caption/scopeなし。canonical/OGなし | HTML/CSSで追加。標準キーボード対応のdetailsとリンクを使用 |
| Q09 | Low | READMEは顔写真・Instagram未登録と記載するがトップには両方あり。配布準備中の説明が残る | READMEと実測要約の配布状態を更新 |
| Q10 | Low | failure1_restored_partial.png右端に無関係なブラウザーサイドバーの一部が写る | 機密と断定できる情報は確認せず。原本保全を優先して未加工。次回撮影を推奨 |

## 技術評価の補足

- VLAN10/20/30のタグ、IP、GW、アクセスポートは現行設計・参照CLI・SVGで整合。サーバー2台は同一VLANで、ルーターACLによる相互隔離はない。
- 各サブIFのin方向ACLは送信元VLANから入る要求・戻りを分ける。社員自GWのecho許可を設計の説明にも補記した。
- establishedはACK/RSTの条件であり状態テーブルではない。echo-replyも先行要求との対応を追跡しない。
- 明示denyの送信元範囲に合わないパケットは暗黙denyで拒否されるため、即座に「素通り」とは評価しない。
- 障害①のWEB 0/4・GW 4/4→復旧後4/4、障害③のICMP 3/4とHTTP失敗→表示復旧は画像で読める。設定変更そのものは原文ログがない。
- TimeoutだけではACL原因と確定できない。特にT03はTESTサーバーのHTTP稼働証跡が不足する。
- 初回Ping損失をARP原因と断定しない。T09、実機、第三者再実行は未実施のまま維持。

Cisco公式資料: [Configure Commonly Used IP ACLs](https://www.cisco.com/c/en/us/support/docs/ip/access-lists/26448-ACLsamples.html)。ACK/RST条件の根拠として参照し、Packet Tracer動作確認の代替には使用しない。

## 改善の優先順位

1. 小工数・大効果: 旧案の識別、検証状態の整理、公開証跡の明示。今回対応。
2. 小〜中工数・大効果: 9試験の追跡、設計理由、目次、構成図拡大、HTMLのアクセシビリティ。今回対応。
3. 中工数・大効果: running-config、show出力、試験前後のカウンタ差分、障害②、TEST HTTP正常系を追加採取。実機器操作が必要で未対応。
4. 中工数: 320/390/768/1280pxの実表示、200%拡大、キーボード全経路、読み上げ、表示速度の測定。環境回復後の受入条件。
5. 発展課題: T09、同一VLAN隔離・管理プレーン・冗長化など。今回の実績として追加しない。

## 変更内容

README.md、トップindex.html、Lab index.html、DESIGN.md、proposed-cli.txt、docs/design-v1.md、docs/packet-tracer-v1.md、docs/review-v1.md、docs/verification-results.md、docs/evidence-inventory.md、本レビューを変更・追加。

既存のPNG10枚、.pkt、SVGのバイナリ/内容とCiscoコードブロックは変更していない。JavaScriptや外部依存も追加しない。

## 実施した検査

コード内検査で以下12項目を確認（正式なHTMLバリデーターや実ブラウザーの代替ではない）:

- HTML explicit tag nesting: PASS
- unique IDs: PASS
- one H1: PASS
- HTML local links and image targets: PASS
- nine individually identified test rows: PASS
- 10 evidence gallery images: PASS
- all images alt dimensions: PASS
- Cisco code blocks unchanged: PASS
- historical source preserved: PASS
- no binary or SVG edits: PASS
- CSS brace balance: PASS
- no added JavaScript: PASS

公開版ではトップとLabのDOM・リンク・見出しを読み、ギャラリー画像10枚の読み込みを確認した。T01画像はEnterで表示し、戻る操作まで確認した。

## 検証できなかったこと・公開状態

- ブラウザー画面キャプチャはタイムアウト。指定390pxへの変更がLabに反映したとは確認できず、スマートフォン表示を合格にしていない。
- 途中でブラウザー接続が終了。公開サイトのダウンロードボタン操作完了、変更後の実表示、速度指標、全外部リンクの到達確認は未完了。
- ローカル実行接続も途中で応答がなくなったため、最終検査とGitHub登録は取得済みソースとGitHub APIで実施。
- PNG10枚の目視ではラボ画面を確認したが、.pkt内部の機密・個人情報、Git履歴全体の秘密情報監査は未実施。
- PRによる提案段階。本番mainへのマージと公開反映はしていない。変更後の本番動作確認済みとは記載しない。

## 完成判定

**条件付き・未完了**。修正案で誤解を減らし、学習成果を追跡しやすくした。提出用の最終完成判定には、PRの画面受入と公開後確認、少なくとも保存済み設定の原本・主要な不足証跡の追加を推奨する。独立再実行なしでもその限界を明示して公開できるが、「独立検証済み」や「本番運用可能」とは表現しない。
