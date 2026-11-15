# ベストオプション｜JavaScriptデモ 試作「BREATHE → BLOOM」v1

作成：2026-11-15
状態：**未完成・ユーザーレビュー待ち。公開されたことやQA合格は「完成」を意味しない。**

## 確認用URL
- JavaScriptの新演出（ファーストビュー＋最初のスクロールのみ）：https://electronic-business-card.pages.dev/best-option-demo/interactive-next/
- 自動QA：https://electronic-business-card.pages.dev/best-option-demo/interactive-next/qa.html
- 以前のJavaScript v3：https://electronic-business-card.pages.dev/best-option-demo/interactive-v3/
- 5つのデモ一覧：https://electronic-business-card.pages.dev/best-option-demo/

## 制作範囲
最初のシーンとスクロール遷移のみ。次のサービス紹介、料金、FAQ、予約UI、最終シーンはユーザーの評価を受けてからこの演出ルールに統一して追加する。

## デザインの核
**ひとつの花が、呼吸に合わせて拡大・回転し、スクロールに連動して暗い画面から明るい世界を生み出す。**
パーツごとに独立したモーションを切り替える構成を避け、連続する場面転換を中心に設計。

## 実装
- オリジナルSVGの16枚の花びらと二重ハロー
- 文字のリビールアニメーション
- 画面固定（sticky）＋スクロール量から進捗計算（requestAnimationFrame）
- 01 BREATHE、02 BLOOM、03 BEYONDの3段階、背景・オブジェ・コピーを同期
- シーンジャンプボタンでタッチ操作にも対応
- PCのカーソルによる微小な視差効果
- prefers-reduced-motion 有効時はアニメーションを止めた静的な導入表示
- 320・390・768・1280px自動チェック用HTML
- 外部ライブラリ・CDN・通信・トラッキング・問い合わせ送信なし
- 架空のLUNOA PILATESを題材にした営業用見本。noindex, nofollow

## レビュー基準（ユーザー判断）
1. 開いた瞬間にインパクトがあるか
2. スクロールで本当に「別の世界へ変化する」感覚があるか
3. 動きとブランドの一体感があるか
4. PCとスマホの両方で心地よいか
5. 読みづらい／過剰な動きがないか

指摘された点を修正し、**ユーザー本人のOK後**に次のシーンへ進む。既存v3は削除・上書きしない。

## 元の正式5デモとの関係
①無料AI制作案、②有料AI制作案、③JavaScript版、④カラー設計版、⑤画像・動画版。
本ページは**③JavaScript版の制作途中プレビュー**であり、新たな完成デモ数に算入しない。
