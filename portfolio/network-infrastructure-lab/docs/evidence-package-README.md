# Network Infrastructure Lab evidence package

Verification by project author in Cisco Packet Tracer 9.0.1. No separate execution by ChatGPT.

Original screenshots have not been independently verified against .pkt.
Screenshots document the selected test moments; CLI-based results are recorded in GitHub verification-results.md.

## Files (SHA-256)
- `Network-Infrastructure-Lab-Final.pkt`: `10b05b7a425cd3c7c4e052d49e1239f0eb86951f1a143eb70496ead9fba36186`
- `evidence/T01_staff_http_success.png`: `d9d7efbecd98bc6ffa2e5cb1e9c0f807a635688658f2cab631af6f509d82ce41`
- `evidence/T03_staff_test_http_denied.png`: `6973c70d373bea42c0e08a73d7aeb1f5f9ae6597d630569a82a18393fb4c0856`
- `evidence/T05_guest_http_denied.png`: `6a53260b5991fc9910d45a9285bcd40f054df83bfaa087bc6fba6578088b7e71`
- `evidence/failure1_trunk_blocked_ping.png`: `2624fd21bbdcef38e1966fbb3a9233fb441379275746bfbcf6dc3165a56dedbe`
- `evidence/failure1_restored_partial.png`: `a8ba459a39d17f6b8fc0fc446494fe42253b95dd4d6a8563c6f86dc796270ba2`
- `evidence/failure1_restored_4of4.png`: `41eb6bac2f2bd2762a41e32384d34e5d1ffca6c5c978c46711826c6d77ca5ec7`
- `evidence/failure3_icmp_working.png`: `93dafdff951769f1e95fe9634037bad6e6d31c721f0271fd031ae83c838ba4db`
- `evidence/failure3_http_timeout.png`: `71d6202317877b7794085b7e144fbd2008351a9418fca7219bf19bb3e29dda37`
- `evidence/failure3_http_restored.png`: `91f0166dedfcc38f86bab669e956abc6fa1ac985ff8de0c319ad7d53a2dd79e8`
- `evidence/network-layout-cropped.png`: `61a508a9541ea9293fd0b692e696543b12ae3bf7eab35fcf8fe9fb64d87edaeb`

## Scope
- Three VLANs (10 / 20 / 30), 802.1Q trunk, Router-on-a-Stick and ACL.
- Nine required tests matched expectations, and three troubleshooting scenarios were observed.
- Do not claim hardware testing, formal penetration testing, or independent simulator replay.
