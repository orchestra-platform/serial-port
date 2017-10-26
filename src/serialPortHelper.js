'use strict';

const SerialPort = require('serialport');
const EventEmitter = require('events');

const MessagesManager = require('./messagesManager.js');
const utils = require('./utils.js');

/**
 * @class SeriaPortHelper
 * @property {Promise} initialized
 * @property {Number} readMessageTimeout Time (in milliseconds) after which readMessage will throw an error if no data is received
 */
module.exports = class SerialPortHelper extends EventEmitter {

    /**
     * Create a new serial port object for the `options.path`.
     * In the case of invalid options, when constructing a new SerialPortHelper it will throw an error.
     * The port will open automatically by default, which is the equivalent of calling `port.open(openCallback)` in the next tick.
     * You can disable this by setting the option `autoOpen` to `false`.
     * @param {String} options.path - The system path of the serial port you want to open. For example, `/dev/tty.XXX` on Mac/Linux, or `COM1` on Windows.
     * @param {Number} [options.baudRate=9600] The baud rate of the port to be opened.
     * @property {Number} [options.stopBits=1] Must be one of these: 1 or 2.
     * @property {String} [options.parity=none] Must be one of these: 'none', 'even', 'mark', 'odd', 'space'.
     * @param {Number} [options.dataBits=8] Must be one of these: 8, 7, 6, or 5.
     * @param {Number} [options.readMessageTimeout=60000] Time (in milliseconds) after which readMessage will throw an error if no data is received
     */
    constructor(options = {}) {
        super();

        // Check serial port module config
        let { path, baudRate, stopBits, parity, dataBits, name } = options;
        if (!path) throw new Error(`Invalid path (${path})`);
        if (!baudRate) baudRate = 9600;
        if (!stopBits) stopBits = 1;
        if (!parity) parity = 'none';
        if (!dataBits) dataBits = 8;

        // Check messages
        if (!options.messages)
            throw new Error('Invalid message definitions');
        this._messages = options.messages;
        this._msgManager = new MessagesManager(this._messages.all);

        // Log
        this._name = name = name || `serial-port-${Math.random().toString(36).substring(7)}`;
        this._log = (level, ...logs) => {
            if (level == 'debug')
                return;
            console.log(`[SeriaPort ${this._name} - ${level}]`, ...logs);
        }

        // Init
        this._byteBuffer = [];
        this._messageBuffer = [];
        this._messageBufferMaxLenght = 10;
        this._subscriptions = [];
        this._isReadingMessage = false;
        this.readMessageTimeout = options.readMessageTimeout || 60 * 1000;

        // Open serial port
        this._log('debug', 'Opening...');
        this._serialPort = new SerialPort(path, { baudRate, stopBits, parity, dataBits });

        this._serialPort.on('open', _ => {
            this._log('info', 'Serial port open');
            this.emit('open');
        });

        this._serialPort.on('close', _ => {
            this._log('info', 'Serial port close');
            this.emit('close');
        });

        this._serialPort.on('error', err => {
            this._log('error', 'Error: ', err);
            this.emit('error', err);
        });

        // Store all the received data in the responseByteBuffer
        this._serialPort.on('data', this._handleSerialPortData.bind(this));
    }


    // This funciton is call when new data is received on the serial port
    _handleSerialPortData(data) {
        // Store the new data
        this._log('debug', 'Received ', utils.byteArrayToString(data));
        // this._log('ResponseByteBuffer = ', utils.byteArrayToString(this._byteBuffer));

        if (!this._isReadingMessage) {
            while (data.length > 0) {
                const isStart = this._messages.isMessageStart(data);
                if (isStart) {
                    this._isReadingMessage = true;
                    break;
                }
                // We don't know what this means, we just ignore the byte
                // Ideally this should never happen 😅
                const byteString = utils.byteArrayToString(data[0]);
                this._log('warn', `*** Ignored ${byteString}`);
                data.shift();
            }
        }

        for (const byte of data) {
            this._byteBuffer.push(byte);
            // console.log('byteBuffer =', utils.byteArrayToString(this._byteBuffer));

            const message = this._msgManager.recognizeMessage(this._byteBuffer);
            if (message) {
                // Remove the message from the byteBuffer
                this.removeFromBuffer(message.bytes.length);

                // Add the message to the messageBuffer
                if (this._messageBuffer.length + 1 > this._messageBufferMaxLenght)
                    this._messageBuffer.shift();
                message.received = new Date();
                this._messageBuffer.push(message);

                // Notify subscriptions
                this._subscriptions.forEach((subscription, index, subscriptions) => {
                    if (subscription.msg != message.type)
                        return;
                    subscription.callback(message);
                    if (subscription.once)
                        subscriptions.splice(index, 1); // Remove subscription
                });

                this._log('info', 'New Message: ', message);
            }
        }
    }


    /**
     * Removes N bytes from the buffer
     * @param {Number} no Number of bytes to be removed. With n=-1 it emptys the buffer
     */
    removeFromBuffer(n) {
        if (n == -1)
            n = this._byteBuffer.length;
        for (let i = 0; i < n && this._byteBuffer.length > 0; i++)
            this._byteBuffer.shift();
    }


    /**
     * Send a Buffer on the serial
     * @param {Buffer} data Buffer or array of bytes
     */
    async writeBytes(data) {
        const sendToSerial = data => new Promise((resolve, reject) => {
            this._serialPort.write(data);
            this._serialPort.drain(resolve);
        });
        await sendToSerial(data);
        this._log('info', 'Sent: ', utils.byteArrayToString(data));
    }


    /**
     * Generate a message
     * @param {String} message
     * @param {Object} data
     * @returns {Array} Byte array
     */
    async sendMessage(message, data = {}) {
        const bytes = this._msgManager.generateMessage(message, data);
        await this.writeBytes(bytes);
    }


    /**
     * Subscribe to a message
     * If options.once = true it returns a promise
     * @param {String} options.msg Message
     * @param {Boolean} [options.once=true] 
     * @param {Function} options.callback
     */
    subscribe(options) {
        const { msg, once, callback } = options;
        this._subscriptions.push({
            msg, once, callback
        });
    }


    /**
     * Read a message from the serialport
     * @param {String} msg Message
     * @returns {Promise} 
     */
    async readMessage(msg) {
        let resolve, reject;
        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });

        let pending = true;
        const timeout = setInterval(_ => {
            if (pending) {
                pending = false;
                reject(new Error('Timeout'));
            }
        }, this.readMessageTimeout);

        const callback = msg => {
            if (pending) {
                pending = false;
                resolve(msg);
            }
        }

        this.subscribe({ msg, once: true, callback });

        return promise;
    }

}
