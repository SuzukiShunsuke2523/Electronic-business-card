# Network Infrastructure Lab — 作者の実測要約・公開証跡

検証環境: Cisco Packet Tracer。利用者提供のCLIログ、画面キャプチャ、および最終保存ファイルに基づく記録。アシスタント側ではPacket Tracerを起動して再試験していません。

## 基本通信試験
| ID | 項目 | 実測 | 判定 |
|---|---|---|---|
| T01 | 社員→WEB HTTP | サイト表示 | 期待どおり |
| T02 | 社員→WEB ICMP | 4/4応答 | 期待どおり |
| T03 | 社員→TEST HTTP | Request Timeout | 期待どおり |
| T04 | 社員→TEST ICMP | 到達不可 | 期待どおり |
| T05 | ゲスト→WEB HTTP | Request Timeout | 期待どおり |
| T06 | ゲスト→社員 ICMP | 到達不可 | 期待どおり |
| T07 | ゲスト→自GW ICMP | 応答成功 | 期待どおり |
| T08 | 社員→自GW ICMP | 応答成功 | 期待どおり |
| T10 | ゲスト→社員GW ICMP | 到達不可 | 期待どおり |

HTTP拒否のTimeout単独ではACL原因と断定できないが、ルーターACL・正常系HTTP・Pingの観測と整合する。T09（サーバー発新規TCP）は未試験。

## L2/L3およびACL確認
- R1: Gi0/0.10、.20、.30がup/up、各ネットワークがconnected。
- SW1: Gi0/1が802.1Q trunking、native VLAN999、allowed/active/forwardingに10,20,30,999。
- ACL: FROM_STAFF、FROM_SERVER、FROM_GUESTを各サブインターフェースin方向に適用。累積カウンタの一致を確認。

## 障害演習
1. **Trunk VLAN20除外**：社員→WEB Pingが0/4、社員→自GWは4/4。show interfaces trunkでallowedが10,30,999であることを確認。VLAN20を再追加後、最終再試験でWEB Ping 4/4。
2. **端末GW誤設定**：社員PCのGWを192.168.10.254に変更。同一サブネットの正規GWへのPing4/4、WEBへのPing0/4。正規値192.168.10.1に修正後WEB Ping4/4。
3. **ACL HTTP許可削除**：FROM_STAFFのHTTP許可を削除。WEBへのPing3/4だがHTTPはRequest Timeout。許可行を戻した後にWebページが表示。

## 成果物・制約
- 最終 .pkt は会話で受領済み。バイナリ存在確認済み、内部解析・アシスタント側シミュレーションは未実施。
- 実際の利用者実測結果を文章化したもので、外部第三者による独立検証ではない。
- [.pkt](../assets/Network-Infrastructure-Lab-Final.pkt)と[PNG10枚](../assets/evidence/)はGitHubに登録済み。[ハッシュ一覧](evidence-package-README.md)を参照。内部設定と画面・参照CLIの完全一致は未確認。
- 会社の社内資料は使わず独立制作した架空のネットワーク構成。

## 公開証跡との対応

「期待どおり」は作者の実施記録の判定。今回の第三者レビューで全試験を再実行した意味ではない。

| 対象 | 公開されている一次証跡 | 確認できる範囲・不足 |
|---|---|---|
| T01 | [HTTP成功画面](../assets/evidence/T01_staff_http_success.png) | PC-STAFFで192.168.20.10のページ表示 |
| T02 | 基本試験単独の画像なし | 障害①復旧後の4/4画像は別時点。基本試験の生ログは未掲載 |
| T03 | [HTTP Timeout](../assets/evidence/T03_staff_test_http_denied.png) | PC-STAFF→192.168.20.20。TESTサーバーHTTP正常系の証跡は未掲載 |
| T04 | 要約のみ | 生ログ・専用画面は未掲載 |
| T05 | [HTTP Timeout](../assets/evidence/T05_guest_http_denied.png) | PC-GUEST→192.168.20.10。Timeout単独ではACL原因を特定できない |
| T06 / T07 / T08 / T10 | 要約のみ | 基本試験の生ログ・専用画面は未掲載 |
| 障害① | [障害中](../assets/evidence/failure1_trunk_blocked_ping.png)、[復旧直後3/4](../assets/evidence/failure1_restored_partial.png)、[最終4/4](../assets/evidence/failure1_restored_4of4.png) | GW成功・WEB失敗と復旧後の応答は読める。Trunk変更の生出力は未掲載 |
| 障害② | 要約のみ | GW設定画面と変更前後のCLI原本は未掲載 |
| 障害③ | [ICMP 3/4](../assets/evidence/failure3_icmp_working.png)、[HTTP Timeout](../assets/evidence/failure3_http_timeout.png)、[HTTP復旧](../assets/evidence/failure3_http_restored.png) | プロトコル別の症状は読める。ACL変更行・行順・カウンタ差分の原本は未掲載 |
| 構成 | [Packet Tracer全体図](../assets/evidence/network-layout-cropped.png) | 機器と接続の概観。ポート・ACL・IP設定の全値は図だけでは分からない |
| T09 | なし | 未実施 |

### 推論の境界

- 障害①は自GWまで成功・WEBまで失敗という観測とVLAN20除外の実施要約が整合する。ただし画面だけでTrunk設定を確定できない。
- 障害②は同一サブネットへの通信と異VLANへの通信を区別する演習。現在の公開資料では作者の要約が根拠となる。
- 障害③ではICMP 3/4が確認できるが、完全な無損失疎通ではない。初回損失はARP等の可能性があっても、パケット記録なしに原因を断定しない。
- L2/L3・ACL欄は提出結果の要約であり、show出力の原文掲載ではない。累積ヒット数の説明は試験前後の差分証拠を代替しない。
- この証跡は基本的な設計・切り分け能力を示す材料であり、本番運用品質、全通信の隔離、侵入耐性を証明しない。
