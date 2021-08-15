# pravosleva-bot-2021 [@pravosleva_bot](https://t.me/pravosleva_bot)
Telegram bot experience with TypeScript

## Development
### `yarn dev`
_See `.env.example`_

## Roadmap DX
- [ ] eslint, prettier
- [x] quick deploy (by scp?)

## Roadmap Buisness
- [ ] smartprice helper

## Quick deploy by `scp`

`deploy-app-config.json`
```json
{
  "prod:restart-all": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "<PORT>",
    "files": "server-dist package.json",
    "path": "<ROOT>/pravosleva-bot-2021",
    "pre-deploy-remote": "pm2 stop all",
    "post-deploy": "pm2 delete all; yarn; pm2 resurrect --update-env"
  },
  "prod:restart-bot": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "22",
    "files": "server-dist package.json",
    "path": "<ROOT>/pravosleva-bot-2021",
    "post-deploy": "yarn; pm2 stop 3; yarn; pm2 restart 3 --update-env"
  },
  "prod:copy-only": {
    "user": "<USER>",
    "host": "<HOST>",
    "port": "22",
    "files": "server-dist package.json",
    "path": "<ROOT>/pravosleva-bot-2021",
    "post-deploy": "yarn; pm2 stop 3; yarn; pm2 restart 3 --update-env"
  },
  "dev": {},
  "staging": {}
}

```
