# Network Infrastructure Lab — 旧設計案（履歴資料）

> **現行の構築手順として使用しないでください。** この下の本文は初期案の記録です。Cisco 1941・3端末・社員→WEB ICMP拒否・旧試験IDは、現行の2911・4端末・ICMP許可・T01〜T10とは異なります。
>
> 現行資料: [要件・詳細設計](docs/design-v1.md) / [CLI・再現手順](docs/packet-tracer-v1.md) / [実測要約と証跡](docs/verification-results.md)。旧案の「未検証」は作成時点の状態であり、現行ラボの実施状況ではありません。

---

# Network Infrastructure Lab — 要件定義・基本設計 v1.0
更新日: 2026-10-17 / 状態: 設計案・Packet Tracer未検証

## 目的と境界
独立制作の小規模オフィスラボ。Cisco Packet TracerでVLAN、802.1Q、Router-on-a-Stick、拡張ACL、HTTP/ICMPの正負試験と故障切り分けを再現する。実企業の構成・設定・資料は使用しない。外部Internet、NAT、DNS、DHCP、冗長化は対象外。これは本番運用向けハードニング完成品ではない。

## 要件ID
- FR-01 社員PCから業務WebサーバーのHTTP(TCP/80)を利用できる
- FR-02 ゲストPCから社員セグメント・サーバーセグメントへL3通信できない
- FR-03 社員PCはゲストセグメントへ通信できず、業務サーバーへのHTTP以外の新規通信を許さない
- FR-04 社員・ゲストPCは自身のデフォルトGWにICMP echoを送れる
- FR-05 許可したTCP応答のみサーバーVLANから社員へ通す（簡易established ACL）。ステートフルFWではない
- FR-06 showコマンドと通信試験により配線・VLAN・トランク・経路・ACLの段階的検証ができる
- FR-07 意図的な誤設定の注入と復旧記録ができる
- NFR-01 実測と期待値を分離する
- NFR-02 会社の社内資料は使用・公開しない

## 論理トポロジ
R1 Gi0/0 ⇆(802.1Q VLAN 10,20,30)⇆ SW1 Gi0/1
SW1 Fa0/1 → PC-EMP (VLAN 10)
SW1 Fa0/2 → SRV-WEB (VLAN 20)
SW1 Fa0/3 → PC-GUEST (VLAN 30)
機器のポート表記はPacket Tracer採用モデルに応じて実際に確認する。候補はRouter 1941 / Switch 2960。

## アドレス・VLAN表
| VLAN | 用途 | セグメント | R1 GW | 端末 | SW1ポート |
|---|---|---|---|---|---|
| 10 | 社員 | 192.168.10.0/24 | 192.168.10.1 | PC-EMP 192.168.10.10 | Fa0/1 |
| 20 | 業務Web | 192.168.20.0/24 | 192.168.20.1 | SRV-WEB 192.168.20.10 | Fa0/2 |
| 30 | ゲスト | 192.168.30.0/24 | 192.168.30.1 | PC-GUEST 192.168.30.10 | Fa0/3 |
すべて固定IP、/24(255.255.255.0)、GWはそれぞれ末尾.1。サーバーはPacket Tracer Services > HTTPをOn、HTTPS/DNSの動作保証は対象外。

## アクセス制御マトリクス
| 送信元 | 宛先・サービス | 期待 |
|---|---|---|
| PC-EMP | SRV-WEB TCP/80 | 許可 |
| PC-EMP | SRV-WEB ICMP echo | 拒否 |
| PC-EMP | PC-GUEST すべて | 拒否 |
| PC-EMP | 192.168.10.1 ICMP echo | 許可 |
| PC-GUEST | 192.168.30.1 ICMP echo | 許可 |
| PC-GUEST | 192.168.20.10 TCP/80 または ICMP | 拒否 |
| PC-GUEST | 192.168.10.10 ICMP | 拒否 |
| SRV-WEB | PC-EMP への新規TCP/80通信またはICMP echo | 拒否（ACL対象のルーティング通信）|
| SRV-WEB | PC-EMP TCP/80応答（ACK/RST） | 許可 |
同一VLAN内のL2通信をRouter ACLだけで制御することはできない。本ラボは端末各1台で対象を限定する。

## ACL設計判断
- R1 Gi0/0.10 に EMP-IN を inbound。社員→GWのICMP、社員→Web TCP/80を許可、それ以外deny。
- R1 Gi0/0.20 に SERVER-IN を inbound。サーバーのTCP/80応答でACK/RSTが立ったもののみ許可、それ以外deny。TCP establishedは簡易フラグ検査でありステートフル追跡ではない。TCPハンドシェイク・HTTPの実動作は未検証。
- R1 Gi0/0.30 に GUEST-IN を inbound。ゲスト→GWのICMPのみ許可、それ以外deny。
- ICMP echo-replyやTCP ACK等の挙動はPacket Tracer上で必ず実測。ACLからrouter自身が生成する応答・同一VLAN通信は評価の前提を確認する。
- HTTPのみの閉域演習でありHTTPSの暗号化を提供しない。本番展開の際はFW/管理VLAN等を別途検討。

## 試験仕様と証跡
| ID | 操作 | 期待 | 実測 | 証跡 |
|---|---|---|---|---|
| T01 | SW1 show vlan brief | 10/20/30と端末ポート | 未実施 | 後日CLI |
| T02 | SW1 show interfaces trunk | Gi0/1 trunk; VLAN 10,20,30 | 未実施 | 後日CLI |
| T03 | R1 show ip interface brief; show ip route | .10/.20/.30サブIF up; 3 connected route | 未実施 | 後日CLI |
| T04 | PC-EMP ping 192.168.10.1 | 応答 | 未実施 | 後日画面 |
| T05 | PC-GUEST ping 192.168.30.1 | 応答 | 未実施 | 後日画面 |
| T06 | PC-EMP Browser http://192.168.20.10 | ページ表示 | 未実施 | 後日画面 |
| T07 | PC-EMP ping 192.168.20.10 | ACL拒否 | 未実施 | 後日画面 |
| T08 | PC-GUEST Browser http://192.168.20.10 | ACL拒否 | 未実施 | 後日画面 |
| T09 | PC-GUEST ping 192.168.10.10 | ACL拒否 | 未実施 | 後日画面 |
| T10 | PC-EMP ping 192.168.30.10 | ACL拒否 | 未実施 | 後日画面 |
| T11 | R1 show access-lists | 対応ACEカウンタ（実装依存） | 未実施 | 後日CLI |
初回pingのARP学習でタイムアウトする場合は再試験し記録。ブラウザのHTTP表示が成功したことはサーバーと経路の一部を確認するが全通信の安全性保証ではない。

## トラブルシューティング演習
1. SW1 Fa0/2のaccess vlan 20を誤って10に変更→社員HTTP失敗。show vlan briefとPC/SRV設定を比較→20に復旧。
2. SW1 Gi0/1のtrunk allowed vlanから20を除く→業務Webに接続不可。show interfaces trunkで認識→20を戻す。
3. R1 Gi0/0.20のencapsulation dot1Qを誤って200に変更→VLAN20経路不通。show run interface・show ip interface brief→20へ戻す。
4. EMP-INのHTTP許可ACEを除去→TCP/80失敗、同一GW pingは成功。show access-listsで確認し復元。
各シナリオで事前正常値、注入コマンド、症状、原因仮説、根拠、復旧コマンド、復旧後試験を記録。環境が用意できるまでは「期待結果」にとどめる。

## 実装順
1. Packet Tracer上で対象モデルとポート一覧確定
2. 物理配置・端末の固定IP・HTTPサーバー設定
3. SW1 VLAN/アクセスポート/トランク設定
4. R1 サブインターフェース設定
5. ACLを一時投入する前にVLAN間到達性をbaseline確認
6. ACL投入と正・負試験、ログ・スクリーンショット採取
7. 意図的故障4件、復旧、再確認
8. 証跡を掲載して初めて「検証済み」表記へ変更

## 公開注記
本資料は一般公開技術仕様を参照して独自制作。実際のPacket Tracer実測・環境互換性は未確認。
参考: https://learningnetwork.cisco.com/s/article/fundamentals-of-vlan-s-router-on-a-stick
