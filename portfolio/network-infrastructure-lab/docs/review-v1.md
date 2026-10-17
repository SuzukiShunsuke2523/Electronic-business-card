# 設計レビュー記録 v1.1 — 2026-10-17

## 判定

- **静的レビュー実施**: 仕様・CLI・テスト条件の論理整合性を確認した。
- **Cisco Packet Tracer実行**: 未実施。CLI受理、動作、疎通、ログ・カウンタは未確認。
- **レビュー上の結論**: 演習用の基本構成は採用可能。ただし下記の制約と追加検証が必要。

## レビュー項目

| ID | 論点 | 判定・処置 |
|---|---|---|
| R01 | SW1のtrunk設定 | 2960の `switchport mode trunk` + `switchport nonegotiate` はCisco公開資料の説明と整合。Packet Tracer機種差は別途確認。 |
| R02 | R1の802.1Q | サブインターフェース Gi0/0.10/.20/.30 とSW1のallowed VLAN 10/20/30に整合性あり。 |
| R03 | native VLAN 999 | SW1がnative VLAN 999を使用する一方、R1にnative 999サブインターフェースはない。**VLAN999をIP通信しない未使用ネイティブとする設計**。リンク上のuntagged通信を疎通させる目的には使えない。設計上の前提を明記する。 |
| R04 | 社員→Web HTTP | `FROM_STAFF` がTCP宛先80を許可、戻り側 `FROM_SERVER` が `established` を許可。**想定される論理整合性**はあるがTCPの成立は未実測。 |
| R05 | 社員→Web ICMP | 社員 echo およびWeb echo-replyのACL条件が対応。実測未実施。 |
| R06 | 社員→TEST・ゲスト→社内 | 該当permitがなく、末尾denyに一致する設計。実測未実施。 |
| R07 | サーバー発新規接続 | `established` はACK/RSTビットを見るもので完全な接続状態確認ではない。**ステートフル防御と呼ばない**。 |
| R08 | ゲストのGatewayへICMP | ACLが宛先30.1のechoを許可するが、ルーター自身が受信する通信の挙動はPacket Tracerにて試験が必要。 |
| R09 | T09の実行性 | Webサーバーが接続元になる新規TCP接続はPacket Tracerの標準サーバーGUIだけで簡単に試験できない場合がある。追加PC等を用いた代替テスト構成が必要。必須受入試験から分離して**追加試験（環境依存）**にする。 |
| R10 | 同一VLAN内トラフィック | Router-on-a-StickのACLを経由しない。同一VLANサーバー間隔離は未提供。 |
| R11 | L2セキュリティ | 未使用ポートshutdown、VLAN999配置は妥当な演習設定。Port-security、BPDU Guard等は発展課題。 |
| R12 | ロギング | Packet Tracerで `log` オプションが使用できない場合は `deny ip ... any` で再投入し、その差分を記録。 |
| R13 | 管理プレーン | SSH、AAA、管理VLAN、ACLによる端末からR1自身への管理アクセス制御は未整備。本番ネットワーク用途不可。 |

## 修正指針

1. 必須受入基準: T01〜T08、T10。T09は追加試験（環境依存）とする。
2. 対向IFの状態に加え、`show interfaces trunk`、`show vlan brief`、`show ip interface brief`、`show access-lists`で設定反映を確認する。
3. 接続拒否テストではブラウザタイムアウトのみで判断せず、正常系と組み合わせてHTTPサービスON・GW・経路を確認する。
4. VLAN30→VLAN10の禁止テストは、**不正なVLAN収容ではIP設定も変わり得る**。障害Dは「VLAN10へ誤収容し、VLAN10のIP設定も取得/設定した端末が社員扱いとなる」という認可設計の限界を説明する。VLAN分離は端末認証ではない。
5. 使用機器・Packet Tracer版を確定後、機種別コマンドの可否とすべてのACL行を再点検する。
6. 本番向け推奨事項を実装済みと混同しない。最終記事で設計スコープと実証範囲を明記。

## 根拠資料

- Cisco Catalyst 2960 VLAN configuration:
  https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-0_2_se/configuration/guide/scg2960/swvlan.html
- Cisco Catalyst 2960 VLAN trunks:
  https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/15-2_3_e/consolidated_guide/b_1523e_2960p_2960c_cg/m_1522e_vlan_trunk_2960s_cg.html

**静的レビューの根拠であり、Packet Tracerによる動作保証を意味しない。**
