# Network Infrastructure Lab — 要件・詳細設計 v1.0

- 作成日: 2026-10-17
- 状態: **設計案（Packet Tracer未実行、設定・通信未検証）**
- 対象: 独立した架空の小規模オフィス、閉域ラボ
- 権利: 勤務先の研修資料・設定・図面・スクリーンショットは使用しない

## 1. 目的と範囲

要件整理→論理設計→設定→テスト→トラブルシューティングの再現可能な流れを示す。インターネット接続、冗長化、無線LAN、DHCP、IPv6、HTTPS、ログ基盤、実運用向けFWは本初版の対象外。パケットトレーサー内のHTTPは暗号化されない演習用。

## 2. 利用想定機器

- R1: Cisco 2911相当のGigabitEthernet0/0を備えるPacket Tracerルーター
- SW1: Cisco 2960相当L2スイッチ
- PC-STAFF、PC-GUEST、SERVER-WEB、SERVER-TEST（各Packet Tracer標準端末）
- R1 Gi0/0 ↔ SW1 Gi0/1 （802.1Q trunk）
- SW1 Fa0/1 社員PC、Fa0/2 WEBサーバー、Fa0/3 ゲストPC、Fa0/4 テスト用サーバー。その他は未使用・shutdown。

※機種によりインターフェース名が異なる場合は実際の表示に合わせ変更。対応状況はPacket Tracerで確認する。

## 3. アドレス・VLAN設計

| VLAN | 用途 | ネットワーク | GW (R1 Gi0/0.x) | 主な端末 |
|---|---|---|---|---|
| 10 | 社員 | 192.168.10.0/24 | 192.168.10.1 | PC-STAFF .10 |
| 20 | サーバー | 192.168.20.0/24 | 192.168.20.1 | SERVER-WEB .10 / SERVER-TEST .20 |
| 30 | ゲスト | 192.168.30.0/24 | 192.168.30.1 | PC-GUEST .10 |
| 999 | ネイティブ用（未使用） | IP設定なし | なし | 端末は収容しない |

固定IP。各端末のマスクは255.255.255.0、GWは所属VLANの.1。サーバーWEBのHTTPサービスをONにする。DNS未使用。

## 4. 通信要件と拒否条件

| ID | 始点 | 宛先 | サービス | 期待 |
|---|---|---|---|---|
| T01 | PC-STAFF | SERVER-WEB | TCP/80 HTTP | 許可 |
| T02 | PC-STAFF | SERVER-WEB | ICMP echo | 許可 |
| T03 | PC-STAFF | SERVER-TEST | TCP/80 HTTP | 拒否（必要な1台のみ公開） |
| T04 | PC-STAFF | SERVER-TEST | ICMP echo | 拒否 |
| T05 | PC-GUEST | SERVER-WEB | TCP/80 HTTP | 拒否 |
| T06 | PC-GUEST | PC-STAFF | ICMP | 拒否 |
| T07 | PC-GUEST | R1 VLAN30 GW | ICMP echo | 許可 |
| T08 | PC-STAFF | R1 VLAN10 GW | ICMP echo | 許可 |
| T09 | SERVER-WEB | PC-STAFF | 新規TCP/80接続 | 原則拒否（簡易ACL） |
| T10 | PC-GUEST | R1 VLAN10 GW | ICMP echo | 拒否 |

同一VLAN内通信はルーターACLを通らないため、VLAN20内のサーバー同士の隔離は対象外。禁止対象についてはTCP/80やICMPなど個別に試験。Routerのインターフェース宛のトラフィックやACL処理順はPacket Tracer実測で確定する。

## 5. セキュリティ設計

- R1 Gi0/0.10 **in**に社員ACL: サーバーWEB宛のHTTPとICMP echoのみ許可、社員→その他サーバー・ゲストは禁止（他の通信もデフォルト拒否）。
- R1 Gi0/0.30 **in**にゲストACL: 自VLANゲートウェイ宛ICMP echoを許可、その他の宛先は禁止。
- R1 Gi0/0.20 **in**にサーバーACL: WEB→社員へのTCP established相当・ICMP echo-replyの戻りを許可し、それ以外のサーバー発通信を拒否。
- これは**ステートレスACL**。TCP establishedはACK/RSTビットを見る簡易条件で、状態追跡や完全な不正接続防御を実現しない。厳格な制御にはステートフルFWなどが必要。
- L2: trunk allowed VLAN 10,20,30,999、native VLAN 999、DTP停止（対応する場合）、未使用ポートshutdown。SSH管理や管理VLANは今回未設定で、本番利用に適さない。

### 受入基準
T01〜T10の期待結果を確認し、使用機器とPacket Tracerバージョン、show出力、HTTP画面、ACLヒットカウンタ、失敗・再試験の記録を残す。通信の成功・失敗は現時点では**全件未検証**。

## 6. 検証・切り分け計画

1. 物理状態: リンクLEDと `show ip interface brief` / `show interfaces status`
2. L2: `show vlan brief`、`show interfaces trunk`
3. L3: `show ip route`、`show ip interface brief`
4. ACL: `show access-lists`、`show running-config`（適用方向・行順）
5. Endpoint: IP/Mask/GW、HTTPサービスの有効化
6. 例題A: trunkでVLAN20をallowedから削除→社員HTTPが失敗→復旧
7. 例題B: PC-STAFFのGW誤設定→異VLAN到達不可→復旧
8. 例題C: STAFF ACLのHTTP permit行を消去→ICMPは成功・HTTP失敗→復旧
9. 例題D: PC-GUESTのアクセスポートをVLAN10へ誤収容→隔離ポリシーが破れる危険→復旧

各シナリオで症状、仮説、確認コマンド、原因、修正前後の出力、再試験を記録する。

## 7. 品質・公開ルール

- 「設計済み」「CLI設定案作成」「シミュレーター実測済み」「公開済み」を別ステータスで管理。
- Packet Tracerプロジェクト(.pkt)は実際に保存・再現試験できてから公開。
- 期待結果と実測値を同一列に混在させない。
- 社内資料・実環境のIP・アカウント・顧客情報は掲載しない。
- Webページには設計書・CLI・試験仕様・記録を相互リンクし、採用担当者が追跡できるようにする。
