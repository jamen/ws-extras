# @jamen/ws-extras

Functions for using WebSockets on Node.js.

This package is inpsired after [`micro`](https://github.com/zeit/micro), except made for WebSockets instead of HTTP. Its designed for use with [`ws`](https://github.com/websockets/ws).

## Usage

### `loop(conn, recv)`

A loop for receiving messages from the connection through `recv`. Once the connection closes the loop completes.

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

Receive the next buffer, text, or JSON message.

The `options` is an object that can contain

- `limit`: A [byte amount](https://github.com/visionmedia/bytes.js#readme) of how large the message can be. Defaults to `'1mb'`.
- `timeout`: A [duration](https://github.com/zeit/ms) to stop waiting for the message. When `false` it never stops. Defaults to `'1m'`.
- `encoding`: The preferred encoding. Defaults to `'utf8'.

The function returns a promise resolving the result. The promise can reject with an error if the limit is reached, the timeout is reached, or an error from `ws` emerges.

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
const { jsonEvent } = require('@jamen/ws')

async function recv (conn) {
    const { name, data } = await jsonEvent(conn)

    // ...
}
```