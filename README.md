# Evercrop by SoLeaf

Evercrop is a public website prototype for buying and selling fresh produce through WhatsApp. Shoppers can buy directly from local growers at farm-direct prices. Farms can use a sales assistant to answer stock questions and capture orders in chat.

## Try the prototype

1. Open [index.html](index.html) in a browser. The site uses plain HTML, CSS, and JavaScript and requires no installation or build.
2. Watch the phone in the hero play a sample WhatsApp order with a farm.
3. Read **For farms** for the sales assistant pitch, or open the farm portal from **Farm portal** in the footer.
4. In **Grow a tree**, use **Place a demo order · +25 pts** to grow the virtual tree from seedling to full canopy.
5. Open **Contact** to try the enquiry form with sample details.

## Prototype scope

The WhatsApp-style conversations, prices, orders, and rewards are simulated in the browser. Tree progress resets when you reload the homepage. The contact form demonstrates the enquiry flow without transmitting the submitted details.

## Project files

| File | Purpose |
| --- | --- |
| [index.html](index.html) | Homepage, shopper and farm paths, and rewards |
| [contact.html](contact.html) | Contact page and sample enquiry form |
| [styles.css](styles.css) | Shared layout, typography, and responsive styles |
| [app.js](app.js) | Homepage phone chat and demo-order points |
| [tree.js](tree.js) | Animated reward tree, shared by the homepage and the shopper portal |
| [farm.html](farm.html) | Farm portal: overview, WhatsApp orders inbox, inventory, AI assistant chats |
| [shop.html](shop.html) | Shopper portal: home, shop and basket, orders, my tree, Ask Evercrop, preferences |
| [stock.js](stock.js) | Shared portal demo data (stock, orders, points) kept in the browser; open a portal with `?reset` to start fresh |
| [stock.css](stock.css) | Styles for both portals |
| [site.js](site.js) | Sticky navigation offsets, hamburger menu, back-to-top button, and demo form |
| [faq-bot.js](faq-bot.js) | "Ask Evercrop" help chat on public pages (scripted FAQ answers) |
| [assets/harvest.jpg](assets/harvest.jpg) | Homepage harvest photo |
