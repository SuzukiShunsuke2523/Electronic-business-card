# Network Infrastructure Lab — 要件・詳細設計 v1.0

- 作成日: 2026-10-17
- 状態: **設計文書 v1.0／利用者がPacket Tracerで通信・障害試験実施済み**（詳細は verification-results.md）
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
| T09（追加） | SERVER-WEB | PC-STAFF | 新規TCP/80接続 | 通常の初期SYNを拒否する設計（未試験、状態追跡なし） |
| T10 | PC-GUEST | R1 VLAN10 GW | ICMP echo | 拒否 |

同一VLAN内通信はルーターACLを通らないため、VLAN20内のサーバー同士の隔離は対象外。禁止対象についてはTCP/80やICMPなど個別に試験。Routerのインターフェース宛通信も含め、作者の実測要約に結果を記録している。ただし公開資料は全試験の生ログを含まず、第三者が追跡可能な範囲は [証跡対応表](verification-results.md#公開証跡との対応) を参照。

## 5. セキュリティ設計

- R1 Gi0/0.10 **in**に社員ACL: 自GW宛ICMP echo、およびサーバーWEB宛のHTTPとICMP echoを許可、社員→その他サーバー・ゲストは禁止（他の通信もデフォルト拒否）。
- R1 Gi0/0.30 **in**にゲストACL: 自VLANゲートウェイ宛ICMP echoを許可、その他の宛先は禁止。
- R1 Gi0/0.20 **in**にサーバーACL: WEB→社員へのACK/RST付きTCPとICMP echo-replyを許可し、他は拒否。参照CLIのTCP行は送信元ポート80を限定していないため、HTTP応答のみとは保証しない。ICMPも要求との対応を追跡しない。
- これは**ステートレスACL**。TCP establishedはACK/RSTビットを見る簡易条件で、状態追跡や完全な不正接続防御を実現しない。厳格な制御にはステートフルFWなどが必要。
- L2: trunk allowed VLAN 10,20,30,999、native VLAN 999、DTP停止（対応する場合）、未使用ポートshutdown。SSH管理や管理VLANは今回未設定で、本番利用に適さない。

### 受入基準
必須T01〜T08・T10と、実施可能な場合の追加T09の期待結果を確認し、使用機器とPacket Tracerバージョン、show出力、HTTP画面、ACLヒットカウンタ、失敗・再試験の記録を残す。必須通信試験9件で利用者実測が提出され、期待結果と一致。詳細は [実測記録](verification-results.md) を参照。追加T09は未実施。

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

## 8. 設計選択と制約

- 役割別VLANでL2ブロードキャストドメインを分離し、VLANをまたぐ通信をR1で制御する。同じVLAN20のWEBとTESTの通信はこのACLを通らない。
- Router-on-a-Stickは単一ルーター・L2スイッチでVLAN間制御を観察できる演習構成。単一トランクリンクの帯域・障害に依存し、冗長化はない。
- WEBとTESTを同じサーバーVLANに配置し、VLAN単位の到達性と宛先ホスト単位の許可を区別して確認する。
- VLAN999には端末とIPを割り当てない。SW1だけにnative 999があり、R1側でuntaggedのL3通信を提供しない設計上の制約がある。

上記は構成の設計上の意味を説明したもので、設計当時の意思決定過程を新たに実測した記録ではない。
