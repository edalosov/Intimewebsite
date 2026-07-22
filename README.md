# Intime Gallery

A private gallery for an NFT collection. Holders connect their wallet, see the
pieces they own from a configurable contract, open any piece into a detail
view, and answer a yearly question tied to that piece — answered submissions
are signed with the holder's wallet as a timestamped, verifiable record.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS + Framer Motion
- wagmi / viem / RainbowKit for wallet connection
- Alchemy NFT API for reading contract ownership
- Prisma + Postgres for gallery config, the versioned question, and answers
- `iron-session` for the admin login

## Local setup

1. Copy `.env.example` to `.env` and fill in the values:
   - `DATABASE_URL` — a Postgres connection string.
   - `ALCHEMY_API_KEY` / `NEXT_PUBLIC_ALCHEMY_API_KEY` — from a free
     [Alchemy](https://dashboard.alchemy.com) app (enable Sepolia and
     Ethereum Mainnet).
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — from
     [WalletConnect Cloud](https://cloud.walletconnect.com), free.
   - `ADMIN_PASSWORD` — password for the `/admin` panel.
   - `SESSION_SECRET` — 32+ random characters, e.g. `openssl rand -base64 32`.
2. Install dependencies and apply the database schema:
   ```bash
   npm install
   npx prisma migrate dev
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Configuring the gallery

Nothing is hardcoded — go to `/admin`, log in with `ADMIN_PASSWORD`, and set:

- **Collection contract** — the ERC-721 address and chain (Sepolia while
  testing, mainnet once the collection is live). Only holders of this
  contract will see anything in their gallery.
- **Question of the year** — publishing a new question archives the current
  one; past answers stay attached to the question they actually answered.

## How answers are verified

Submitting an answer has the holder sign an EIP-191 message (question,
answer, token, timestamp) with their wallet — no gas cost. The server
recovers the signer from that signature and separately confirms via Alchemy
that the wallet still owns the token before saving the answer, so a stored
answer is both wallet-authenticated and ownership-checked.
