# Packet Tracer設定案・検証手順 v1.0

> **初期の設計案（2026-10-17の履歴）**：このCLI案を全文そのまま投入して再現できることは確認していません。文書中の「未検証」「未実施」は作成当時の状態です。現在の実測は[検証結果](verification-results.md)、使用構成は[詳細設計](design-v1.md)、完成した構築ファイルは[最終.pkt](../assets/Network-Infrastructure-Lab-Final.pkt)を参照してください。現行のrunning-configとの一致を保証するものではありません。

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

## 4. 初期のテスト方法（作成当時は未実施、現在は別記録に実測結果あり）

- T01: PC-STAFFのWeb Browserで `http://192.168.20.10/` を開く。想定: 表示される。
- T02: PC-STAFFから `ping 192.168.20.10`。想定: 応答あり（初回ARP収束によるタイムアウトは再試行）。
- T03: 社員Browserから `http://192.168.20.20/`。想定: 表示不可。
- T04: 社員から `ping 192.168.20.20`。想定: 応答なし。
- T05: ゲストBrowserから `http://192.168.20.10/`。想定: 表示不可。
- T06: ゲストから `ping 192.168.10.10`。想定: 応答なし。
- T07/T08: 各PCの自VLANゲートウェイへPing。想定: 応答あり。
- T09（追加試験・必須受入対象外）: SERVER-WEBからPC-STAFFへ新規TCP接続を実施するには宛先サービスと送信元クライアント役割を用意する。シミュレーターで表現できなければ「試験不可」と記録し、代替テストを設計する。
- T10: ゲストから `ping 192.168.10.1`。想定: 応答なし。

## 5. evidence記録テンプレート（当時の空欄例）

| test_id | PTバージョン | 実施日時 | 送信元 | 宛先・プロトコル | 期待 | 実測 | 証跡ファイル | 判定 | コメント |
|---|---|---|---|---|---|---|---|---|---|
| T01 | 当時未記録 | 当時未実施 | PC-STAFF | WEB:TCP/80 | 許可 | 初期テンプレート | - | 当時未判定 | 現在の結果は verification-results.md を参照 |

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
