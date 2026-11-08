# Packet Tracer参照CLI・再現手順 v1.1

> **設定例と実測記録を区別**: 作者はCisco Packet Tracer 9.0.1で基本通信9件・障害演習3件を実施しています（[実測要約](verification-results.md)）。以下は2911/2960向けの参照CLIであり、最終.pktから抽出したrunning-configではありません。全行が保存済み設定と一致すること、別環境での再実行、実機での動作は未確認です。新規ラボで機種・インターフェース名・対応コマンドを確認して使用してください。

## 1. SW1設定案

```cisco
enable
configure terminal
hostname SW1
vlan 10
 name STAFF
vlan 20
 name SERVERS
vlan 30
 name GUEST
vlan 999
 name UNUSED_NATIVE
interface gigabitEthernet0/1
 description TRUNK_TO_R1
 switchport mode trunk
 switchport trunk native vlan 999
 switchport trunk allowed vlan 10,20,30,999
 switchport nonegotiate
 no shutdown
interface fastEthernet0/1
 description PC_STAFF
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 no shutdown
interface fastEthernet0/2
 description SERVER_WEB
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
 no shutdown
interface fastEthernet0/3
 description PC_GUEST
 switchport mode access
 switchport access vlan 30
 spanning-tree portfast
 no shutdown
interface fastEthernet0/4
 description SERVER_TEST
 switchport mode access
 switchport access vlan 20
 spanning-tree portfast
 no shutdown
interface range fastEthernet0/5-24
 switchport mode access
 switchport access vlan 999
 shutdown
interface gigabitEthernet0/2
 switchport mode access
 switchport access vlan 999
 shutdown
end
write memory
```

## 2. R1設定案

```cisco
enable
configure terminal
hostname R1
interface gigabitEthernet0/0
 description TRUNK_TO_SW1
 no ip address
 no shutdown

ip access-list extended FROM_STAFF
 permit icmp 192.168.10.0 0.0.0.255 host 192.168.10.1 echo
 permit tcp 192.168.10.0 0.0.0.255 host 192.168.20.10 eq 80
 permit icmp 192.168.10.0 0.0.0.255 host 192.168.20.10 echo
 deny ip 192.168.10.0 0.0.0.255 any log

ip access-list extended FROM_GUEST
 permit icmp 192.168.30.0 0.0.0.255 host 192.168.30.1 echo
 deny ip 192.168.30.0 0.0.0.255 any log

ip access-list extended FROM_SERVER
 permit tcp host 192.168.20.10 192.168.10.0 0.0.0.255 established
 permit icmp host 192.168.20.10 192.168.10.0 0.0.0.255 echo-reply
 deny ip 192.168.20.0 0.0.0.255 any log

interface gigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 ip access-group FROM_STAFF in
interface gigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0
 ip access-group FROM_SERVER in
interface gigabitEthernet0/0.30
 encapsulation dot1Q 30
 ip address 192.168.30.1 255.255.255.0
 ip access-group FROM_GUEST in
end
write memory
```

**重要**: Cisco IOSのインターフェース宛のローカル制御通信、ACLの一致順序、Packet Tracerでの `log` / `established` の挙動は要実測。GWのICMP確認はローカル入力処理の確認を兼ねる。上記はルーター自体の管理プレーン保護を完成させるものではない。

## 3. 端末設定

| 端末 | IP | マスク | GW | 特記 |
|---|---|---|---|---|
| PC-STAFF | 192.168.10.10 | 255.255.255.0 | 192.168.10.1 | Desktop > IP Configuration |
| SERVER-WEB | 192.168.20.10 | 255.255.255.0 | 192.168.20.1 | Services > HTTP: On |
| SERVER-TEST | 192.168.20.20 | 255.255.255.0 | 192.168.20.1 | Services > HTTP: On |
| PC-GUEST | 192.168.30.10 | 255.255.255.0 | 192.168.30.1 | Desktop > IP Configuration |

## 4. 再現試験の方法（実施結果は別資料）

- T01: PC-STAFFのWeb Browserで `http://192.168.20.10/` を開く。想定: 表示される。
- T02: PC-STAFFから `ping 192.168.20.10`。想定: 応答あり（初回ARP収束によるタイムアウトは再試行）。
- T03: 社員Browserから `http://192.168.20.20/`。想定: 表示不可。
- T04: 社員から `ping 192.168.20.20`。想定: 応答なし。
- T05: ゲストBrowserから `http://192.168.20.10/`。想定: 表示不可。
- T06: ゲストから `ping 192.168.10.10`。想定: 応答なし。
- T07/T08: 各PCの自VLANゲートウェイへPing。想定: 応答あり。
- T09（追加試験・必須受入対象外）: SERVER-WEBからPC-STAFFへ新規TCP接続を実施するには宛先サービスと送信元クライアント役割を用意する。シミュレーターで表現できなければ「試験不可」と記録し、代替テストを設計する。
- T10: ゲストから `ping 192.168.10.1`。想定: 応答なし。

## 5. evidence記録テンプレート

| test_id | PTバージョン | 実施日時 | 送信元 | 宛先・プロトコル | 期待 | 実測 | 証跡ファイル | 判定 | コメント |
|---|---|---|---|---|---|---|---|---|---|
| T01 | 未記録 | 未実施 | PC-STAFF | WEB:TCP/80 | 許可 | 未検証 | - | 未判定 | - |

確認コマンド:
```cisco
show ip interface brief
show ip route connected
show access-lists
show running-config
show vlan brief
show interfaces trunk
show interfaces status
```
スイッチ用showコマンドはSW1で実施。実装後に証跡の取得日時と投入済み設定との差分を保存する。

## 6. 設定を読む際の注意

- ACLは各送信元VLANからR1へ入る方向（in）で評価される。社員→WEBの要求はFROM_STAFF、WEB→社員の戻りはFROM_SERVERを通る。
- FROM_SERVERのTCP行には送信元ポート80の条件がない。WEBのIPから社員サブネットへのACKまたはRST付きTCPをポートに関係なく許可する設定例であり、HTTP応答だけの保証ではない。
- establishedは接続状態を保存しない。echo-replyも先行するechoとの対応を追跡しない。送信元IPやフラグの偽装への防御を実証したものではない。
- 各明示denyの送信元範囲に一致しないパケットも、後続の暗黙denyで拒否される。暗黙denyには本文のlog指定は付かない。
- VLAN999はSW1側の未使用native VLAN。R1にnative 999サブインターフェースを設けていないため、VLAN999のL3疎通を提供する構成ではない。利用者データは10/20/30のタグ付き通信を前提とする。
- HTTP許可行を復旧する場合は、明示denyより前に配置する。末尾への追記だけでは許可されない。投入前後にshow access-listsで順序を確認する。

## 7. 再現時に追加採取する証跡（未採取分）

1. 配布.pktのコピーを開き、9.0.1・機種・端末IP/Mask/GW・両サーバーのHTTP Onを確認する。
2. R1/SW1のshow running-configと上記show出力をテキスト保存し、この参照CLIとの差分を記録する。
3. T01〜T08・T10を実施日時とともに再実行し、正負試験を対にして記録する。T03はSERVER-TESTのHTTP稼働を別途確認する。
4. ACLは試験直前・直後のカウンタ差分を記録する。累積値だけでは特定の試験が一致したことを立証できない。
5. 障害ごとに注入・復旧コマンド、確認出力、再試験を保存する。障害②の画面とT09は今回の公開証跡に不足している。
6. 保存・再オープン後に再試験し、最終.pktのハッシュと設定を対応付ける。

これらは今後の採取手順であり、今回実行済みとは扱わない。
