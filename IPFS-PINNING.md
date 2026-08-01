# IPFS pinning — Kotkata collections

**Status: pinned on the home Raspberry Pi (`nft-ticket-server`, 84.242.164.248) since 2026-08-01.**

## Why this file exists

On 2026-08-01 every NFT in the testnet collection showed up with **no metadata** in wallets.
The contracts were fine and `tokenURI()` returned the correct value — the *content* was gone.

Root cause: the two collections were uploaded to **two different providers**, and one of them died.

| Collection | Provider used at upload | Outcome |
|---|---|---|
| Production 10 000 (`Kotkata by GembaPay` / `KOTKATA`) | **Filebase** | survived |
| Testnet 500 (`Kotkata` / `KTKT`) | **web3.storage** (`w3s.link`) | **pin dropped — 504 "no providers found for the CID"** |

The legacy free tier of web3.storage was retired and the old uploads lost their pins. Nothing in
the code, the contracts or the config had changed. 202 minted testnet NFTs (98 Sepolia + 72 BSC
Testnet + 32 Amoy) lost their metadata at once. Mainnet was never affected.

## Where the content lives now

All four CIDs are pinned on the Raspberry Pi's Kubo node:

- host `84.242.164.248` (`nft-ticket-server`), `IPFS_PATH=/home/slavy/.ipfs`, systemd unit `ipfs`, `User=slavy`
- PeerID `12D3KooWLeSkrD7EWgT1SA2XQ76sDzqPxCpqL1wvYxgF9SgWJ8Ki`
- repo 1.2 GB of a 10 GB `StorageMax`; SD card 14 GB free

| What | CID | Source folder on the laptop |
|---|---|---|
| Testnet metadata (500) | `bafybeifqku3ou4qe3swdo3flcdd6fuyxfyjrlbskyahn7tdahkodmjtwwm` | `~/Pictures/kotkata-metadata-500/json_metadata` |
| Testnet images (500) | `bafybeigj75qeur4k52oc5ps3yso25temlka2z2spzi4iy772ztsu6ddfge` | `~/Pictures/kotkata` |
| Mainnet metadata (10 000) | `bafybeiaoqjtxd7ptabsz67afmenvuf45tgqlwgorjttkaz7zxkmvjuoeqa` | `…/kotkata-production/Cat_sphynx_04_jan_26-*/script/output/metadata` |
| Mainnet images (10 000) | `bafybeihblwcb2mp6cyjj3vmpm4agzdilpzx6ia7xahhubfqszkbzj3qvdm` | `…/kotkata-production/Cat_sphynx_04_jan_26-*/script/output/images` |

The **testnet** pin is now the only copy anywhere — the Pi is authoritative for it.
The **mainnet** pin is a second copy; Filebase still serves it.

## Reproducing a CID

The CIDs come out of plain Kubo defaults, so any of these folders can be re-added anywhere and
will produce the same CID. Always dry-run first:

```bash
export IPFS_PATH=/home/slavy/.ipfs
ipfs add -r -Q --only-hash --cid-version=1 <folder>   # must equal the CID in the table
ipfs add -r -Q --cid-version=1 --pin=true <folder>    # only if it matched
```

Do **not** pass `--raw-leaves=false` or use CIDv0 — both produce a different CID.

## Node configuration applied

- `ufw allow 4001/tcp` + `4001/udp` (v4 and v6) — was closed, the node could only reach the
  network through circuit relays.
- `Reprovider.Strategy = "roots"`, `Reprovider.Interval = "12h"` — the default `all` would try to
  announce all 23 370 blocks each cycle, which a Pi on a home line never finishes. Announcing the
  4 roots is enough: a gateway finds the root and then bitswaps the subtree over the same connection.
- API and Gateway stay bound to `127.0.0.1` (`5001` / `8080`). The `ufw` rule allowing 5001 from
  anywhere is inert because nothing listens on the public interface — leave it or tighten it, but
  it is not an exposure.

## Known weakness

The router does **not** forward port 4001 to the Pi, so the node still advertises only
`/p2p-circuit` relay addresses and has no directly dialable address. Retrieval works, but a small
share of first-time fetches time out on public gateways and succeed on retry.

Fixes, best first:

1. Forward TCP+UDP 4001 to the Pi on the router (the Pi is `192.168.1.100` on the LAN). It already
   has a global IPv6 address, so allowing inbound 4001 over IPv6 achieves the same thing.
2. Add a second, independent pin. The testnet collection is only **71 MB** — it fits in any free
   tier several times over. A single provider is exactly what caused this outage.

## Verification

```bash
# what a wallet actually does
curl -s -X POST https://ethereum-sepolia-rpc.publicnode.com -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"to":"0x79034E34db7787dCAF131EF53d161e47Af810242","data":"0xc87b56dd0000000000000000000000000000000000000000000000000000000000000061"},"latest"]}'
# -> ipfs://bafybeifqku3ou4…/097.json
curl -sL https://ipfs.io/ipfs/bafybeifqku3ou4qe3swdo3flcdd6fuyxfyjrlbskyahn7tdahkodmjtwwm/097.json
```

Verified 2026-08-01: all four CIDs return byte-identical content through both `ipfs.io` and
`dweb.link`, and the full chain → metadata → image path resolves for Sepolia token #97.
