const bytes = require('bytes')

async function loop (conn, recv) {
    if (conn.readyState === 0) {
        return new Promise((resolve, reject) => {
            conn.on('open', () => {
                loop(conn, recv).then(resolve, reject)
            })
        })
    }

    while (conn.readyState === 1) {
        await recv(conn)
    }
}

function buffer (conn, options = {}) {
    const limit = bytes(options.limit || '1mb')
    let timeout = false

    if (typeof options.timeout === 'number') {
        timeout = options.timeout
    } else if (options.timeout === undefined) {
        timeout = 60000
    } else if (options.timeout) {
        timeout = ms(options.timeout)
    }

    return new Promise((resolve, reject) => {
        if (conn.binaryType !== 'nodebuffer' && conn.binaryType !== 'arraybuffer') {
            return reject(new Error('Connection\'s binary type unsupported'))
        }

        conn.once('message', onMessage)
        conn.once('close', onClose)
        conn.once('error', onError)

        let timer = null

        if (timeout !== false && timeout !== Infinity) {
            timer = setTimeout(() => {
                finish()
                reject(new Error('Connection timed out'))
            }, timeout)
        }

        function onMessage (data) {
            const buf = Buffer.from(data)

            finish()

            if (Buffer.byteLength(buf) > limit) {
                reject(new Error('Message is too large'))
            } else {
                resolve(buf)
            }
        }

        function onClose () {
            finish()
            reject(new Error('Connection closed before sending a message'))
        }

        function onError (error) {
            finish()
            reject(error)
        }

        function finish () {
            clearTimeout(timer)
            conn.off('message', onMessage)
            conn.off('close', onClose)
            conn.off('error', onError)
        }
    })
}


async function text (conn, options = {}) {
    return (await buffer(conn, options)).toString(options.encoding || 'utf8')
}

async function json (conn, options = {}) {
    return JSON.parse(await buffer(conn, options))
}

async function jsonEvent (conn, options = {}) {
    const message = await json(conn, options = {})
    if (
        typeof message === 'object' &&
        message != null &&
        typeof message.event === 'string' &&
        typeof message.data  === 'object' &&
        message.data != null
    ) {
        for (const key in message) {
            if (key !== 'data' && key !== 'event') {
                throw new Error('Message is not a valid JSON Event')
            }
        }
        return message
    } else {
        throw new Error('Message is not a valid JSON Event')
    }
}

function send (conn, message) {
    return new Promise(resolve => {
        conn.send(JSON.stringify(message), () => resolve(conn))
    })
}

function sendEvent (conn, event, message) {
    return send(conn, { event, message })
}

function sendError (conn, message, extra) {
    return send(conn, { event: 'error', data: { message, ...extra } })
}

module.exports = { loop, buffer, text, json, jsonEvent, send, sendEvent, sendError }