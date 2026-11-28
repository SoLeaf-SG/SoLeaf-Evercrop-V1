# EverCrop (prototype)

Public website + farm/shopper portals for EverCrop, a SoLeaf product: an AI WhatsApp chatbot that lets Singapore farms sell direct to customers, plus a tree-growing rewards game for shoppers.

Plain HTML, CSS and JS. No build step. Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Pages

| File | What |
|---|---|
| `index.html` | Home: USP, WhatsApp demo, how it works, tree game, farm map |
| `farms.html` | For farms: chatbot features, plans (3-month starter) |
| `shoppers.html` | For shoppers: why it's cheaper, tree game, farm map |
| `contact.html` | Contact form (front-end only, nothing is sent yet) |
| `terms.html`, `privacy.html` | Draft Terms and PDPA Privacy Policy (need legal review) |
| `login.html`, `register.html`, `forgot-password.html` | Auth (farm or shopper) |
| `portal-farm.html`, `portal-shopper.html` | Dashboards with demo data |

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Farm | farm@demo.sg | evercrop123 |
| Shopper | shopper@demo.sg | evercrop123 |

New accounts can be created on `register.html`.

## Prototype limits

- Accounts, sessions and tree progress are stored in the browser's localStorage. This is not secure and is for demo only.
- The forgot-password page shows a confirmation but sends no email.
- Farms, prices, orders and the Singapore map are illustrative.
