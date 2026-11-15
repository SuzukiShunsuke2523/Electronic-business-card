# LUNOA PILATES｜JavaScript動作版・改訂試作 v1
作成日：2026-11-15

## 位置付け
**依頼者レビュー待ちの未完成試作。**
以前の独立した花の演出はユーザー評価で不採用。
新しい制作土台はユーザーが指定した「集客・予約導線重視版」:
https://electronic-business-card.pages.dev/best-option-demo/conversion-v1/

## レビュー用URL
https://electronic-business-card.pages.dev/best-option-demo/interactive-conversion-v1/
品質試験：https://electronic-business-card.pages.dev/best-option-demo/interactive-conversion-v1/qa.html

## 変えていない部分
- ファーストビューの基本構成：左に説明・体験CTA、右に実写写真
- ピラティスの特徴3点・実写画像
- 3つの料金プラン（体験 ¥3,000 / 単発 ¥7,000 / 4回 ¥26,000）
- 初回の流れ3段階、FAQ4件、予約案内ダイアログ
- 実際の予約・決済・問い合わせ送信はしない
- 写真は元ページと同じPexelsフリー素材、人物/施設は架空LUNOAと無関係

## JavaScriptで追加した体験
1. ページを開くと見出しと写真フレームが段階的に現れる
2. 写真が縦長の大きく丸い枠から「全幅・角なし」の形へ変化する（実際にwidth/height/border-radiusを更新）
3. 全幅の写真上に大きなコピーが出る
4. 別の実写写真に明確にクロスフェードして新しいコピーへ切り替わる
5. 3つのシーンへ直接移動できるボタン
6. サービスカードが立体的に現れ、ポインタで浮き上がる
7. 料金選択時に数字のカウント・要約エリアの色・選択カードが連動
8. prefers-reduced-motionに配慮し、停止環境ではアニメーションを避ける

## 完成条件
**ユーザー本人のOKがあるまで正式5デモの③は未完成**。
開発者のQA合格やWeb公開は完成判定ではない。

## QA
320/390/768/1280pxで形状変化（幅・角の丸み・別写真の不透明度）、横はみ出し、料金操作、予約案内、FAQをブラウザで検証する。
QA URLは内部確認用。画像の外部Pexels CDN提供は配信状況に依存。

## 元ページとの違い
HTML構造は元のconversion-v1/index.htmlを複製し、CSSとJavaScriptは元のstyle.css/app.jsをそのまま読み込む方式。改訂版固有の演出を別CSS/JSに分離したため、基礎ページの改変なしで比較できる。
