# @jamen/ws

WebSocket functions that make life easier.

Its used with [`ws`](https://github.com/websockets/ws) or similar libraries.

## Install

```sh
npm i @jamen/ws
```

## Usage

### `loop(conn, recv)`

Starts a message loop, where the `recv` parameter is an async function called continously to handle messages. The connection has closed once the loop is finished.

```js
const WebSocket = require('ws')
const { loop } = require('@jamen/ws')

const server = new WebSocket.Server({ host, port })

server.on('connection', conn => loop(conn, recv))

async function recv (conn) {
    // Receive messagess
}
```

To receive messages from `conn` see the functions `buffer`, `text`, and `json`.

### `buffer(conn, options)`

### `text(conn, options)`

### `json(conn, options)`

Receive the next message as a buffer, text, or JSON.

The `options` parameter is an object containing

- `limit`: A [byte amount](https://github.com/visionmedia/bytes.js#readme) setting how large the message can be. Defaults to `'1mb'`.
- `timeout`: A [duration](https://github.com/zeit/ms) to stop waiting for the message. When `false` it never stops. Defaults to `'1m'`.
- `encoding`: The preferred encoding. Defaults to `'utf8'.

The function returns a promise resolving to a buffer, text, or JSON. The promise can be rejected if the limit is passed, the timeout is passed, or an error from `ws` emerges.

```js
const { buffer, text, json } = require('@jamen/ws')

async function recv (conn) {
    let message
    // Next message as a buffer
    message = await buffer(conn)
    // As text
    message = await text(conn, { limit: '5mb', timeout: '30s' })
    // As JSON
    message = await json(conn, { limit: 2097152, timeout: 60000 })
    // Without timeout
    message = await json(conn, { timeout: false })
}
```

### `jsonEvent(conn, options)`

Similar to `json` except only `{ event, data }` is allowed.

The `options` are the same.

The returned promise can be rejected if the message is not a `{ event, data }` structure.

```js
const { event } = require('@jamen/ws')

async function recv (conn) {
    const { name, data } = await jsonEvent(conn)

    // ...
}
```