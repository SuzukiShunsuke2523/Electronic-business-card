# Network Infrastructure Lab — ユーザー実測記録

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
- 最終 .pkt は利用者から受領しGitHubへ登録済み。バイナリの存在は確認済みだが、アシスタント側の内部解析・独立シミュレーションは未実施。
- 実際の利用者実測結果を文章化したもので、外部第三者による独立検証ではない。
- 最終 .pkt と証跡画像10枚は2026-10-18にGitHub mainへ登録済み。 [.pkt](../assets/Network-Infrastructure-Lab-Final.pkt) / [証跡一覧](evidence-inventory.md)。10枚は代表場面を記録したもので、9試験のすべてに個別画像があるという意味ではない。
- 会社の社内資料は使わず独立制作した架空のネットワーク構成。
