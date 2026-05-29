# MorphPadala

Cross-border remittance for OFWs, built on Morph L2.

MorphPadala lets Filipino workers abroad send money home in seconds — not days — at a fraction of the cost of traditional remittance services. No banks, no middlemen, just fast stablecoin settlement on Morph.

Built for the **Build In! Payments Hackathon 2026** · Track: Cross-Border Remittance

---

## The Problem

OFWs collectively send billions of pesos home every year, but traditional remittance services charge 5–7% in fees and take 1–3 business days to settle. For a family waiting on ₱10,000, that's ₱500–₱700 gone and a long wait on top of it.

## What MorphPadala Does

- Converts the sender's currency to USDC and routes it through Morph L2
- Settles in ~3 seconds with a 0.2% fee + minimal gas
- Shows the sender exactly how much they're saving vs. traditional services
- Delivers funds directly to the recipient's wallet

## Tech Stack

- **React + Vite** — frontend
- **Morph L2 (Testnet)** — settlement layer
- **USDC stablecoin rails** — currency bridging
- **Morph SDK** — chain interaction

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

or

For Deployed App
https://morphpadala.vercel.app/

## Supported Corridors

| From | Currency |
|------|----------|
| United States | USD |
| UAE | AED |
| Singapore | SGD |
| Japan | JPY |
| South Korea | KRW |

All corridors settle to PHP in the recipient's wallet.

## Hackathon

Built during the **Build In! Payments** sprint by Morph, Blockchain4Youth, and DvCode Technologies.

`#MorphBuildSprint` `#MorphBuildPH`
