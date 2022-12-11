# Build Sample Product Checkout

- Built based on Remix FullStack Framework

## Tech stack:

- Typescript
- [Remix Fullstack Framework](https://remix.run/docs)
- [Json-Rules-Engine](https://github.com/CacheControl/json-rules-engine)
- Unit Test: [Vitest](https://vitest.dev)
- CyPress: Not Yet

## Solution:

- Using Json Rules Engine to configure Campaign program/ Promotion / Discount
- Try apply to types: DEAL / DISCOUNT

## TODO Improvement:

- Change Voucher Code to Logined User information
- Define pattern to calculate price after apply promotion
- Apply type of all of objects in RuleEngine

## How to Testing

- Go to Products page
- Select item to cart
- Go to cart page
- Apply Voucher Code = Company Name

## Development
From your terminal:

```sh
npm install
```

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
