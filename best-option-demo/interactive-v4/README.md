# BEST OPTION — LUNOA PILATES / Photo & Film Experience v4

## 公開
https://electronic-business-card.pages.dev/best-option-demo/interactive-v4/

## 概要
v3のJavaScript・CSSを読み込み、新規の実写ビジュアルを追加した独立デモ。
- ヒーロー: マットでのピラティス運動を撮影したPexels動画 1点（MP4、約11秒）/ 自動再生は無音、停止・再開ボタン、モーション軽減対応
- ヒーローポスターとストーリー: 実写ストック写真
- Concept: 実写ピラティス写真
- Gallery: 2枚の実写写真とスクロール時の控えめな演出
- 料金選択、文字演出、3ステップ操作、FAQ4項目、モーダルはv3を流用
- ページは架空ビジネスの営業デモ。実在店舗の写真ではなく、予約・課金・送信はない。
- 外部Pexels CDNから写真・動画を取得。素材が削除される、CDNがブロックされるなどの場合に表示できないリスクあり。

## 素材クレジットとライセンス（2026-11-11参照）
共通ライセンス：https://www.pexels.com/legal-pages/license/
商用・個人目的で無料。出典表示は義務ではないが任意で明記した。人物・施設がベストオプションや架空LUNOAに参加・推薦していると誤認させないこと。素材単体の転売・商標使用・ほかのストック配布先への再配布をしないこと。

| 種別 | 作者 | 出典 |
|---|---|---|
| 動画 | ArtHouse Studio | https://www.pexels.com/video/woman-doing-pilates-pose-6377752/ |
| 写真 | Ahmet Kurt | https://www.pexels.com/photo/woman-in-gray-top-stretching-on-pilates-reformer-25596676/ |
| 写真 | Ahmet Kurt | https://www.pexels.com/photo/fit-woman-exercising-on-pilates-reformer-25596679/ |
| 写真 | Ahmet Kurt | https://www.pexels.com/photo/woman-on-a-pilates-tower-25599837/ |
| 写真 | Ahmet Kurt | https://www.pexels.com/photo/woman-practicing-reformer-pilates-in-a-modern-studio-33360051/ |

## 表示速度に関する制約
外部CDN参照のため回線と配信側に依存。写真は遅延読み込み、動画はpreload=metadata、無音・inlineで再生。モーション軽減設定が有効なら動画を停止して静止画を優先する。実配信速度の測定は別途行う。

## QA
本番公開後のブラウザで、表示・写真/動画取得・再生/停止・料金・FAQ・横スクロールを確認する。
