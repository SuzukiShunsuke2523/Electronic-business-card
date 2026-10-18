# Evidence inventory — Network Infrastructure Lab

実測者によるCisco Packet Tracer 9.0.1の記録。アシスタントによる別環境再実行は未実施。

| Evidence | Observation | GitHub binary |
|---|---|---|
| Network-Infrastructure-Lab-Final.pkt | 最終構築ファイル | 登録済み |
| T01_staff_http_success.png | 社員WEB HTTP許可 | 登録済み |
| T03_staff_test_http_denied.png | 社員TEST HTTP拒否 | 登録済み |
| T05_guest_http_denied.png | ゲストWEB HTTP拒否 | 登録済み |
| failure1_trunk_blocked_ping.png | Trunk障害中0/4 | 登録済み |
| failure1_restored_partial.png | Trunk復旧直後の一部応答 | 登録済み |
| failure1_restored_4of4.png | Trunk復旧後4/4 | 登録済み |
| failure3_icmp_working.png | ACL障害中ICMP疎通 | 登録済み |
| failure3_http_timeout.png | ACL障害中HTTP遮断 | 登録済み |
| failure3_http_restored.png | ACL復旧後HTTP表示 | 登録済み |
| network-layout-cropped.png | トポロジー画面（PCのパス表示を切り落としたもの） | 登録済み |

CLI確認結果とGW障害演習②は verification-results.md に要約を記録。show出力の原文や障害②の専用画像は未掲載。図解SVGは ../network-diagram.svg に公開済み。
構築ファイルと検証画像10枚を以下に配置。Packet Tracerでの別環境再実行は未実施。

## 公開先

- [Packet Tracer本体](../assets/Network-Infrastructure-Lab-Final.pkt)
- [検証画像一覧](../assets/evidence/)
- [ファイルのSHA-256一覧](evidence-package-README.md)
- [公開ページ](https://electronic-business-card.pages.dev/portfolio/network-infrastructure-lab/#verification-images)


## 2026-10-18 最終登録確認

GitHub main の `assets/Network-Infrastructure-Lab-Final.pkt`（78,787 bytes）と `assets/evidence/` のPNG10枚をAPIで存在確認。`docs/evidence-package-README.md`および専用ページHTML内の構築ファイル・画像リンクも確認。Cloudflare Pages上でのダウンロード・画像表示の実操作確認は別途必要。
