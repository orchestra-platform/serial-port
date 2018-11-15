'use strict';

/**
 * Message Fragment
 * @typedef {Object} MessageFragment
 * @property {String} name - Name of the fragment
 * @property {String} [desc] - Description of the fragment
 * @property {Array} pattern - Array of bytes, function or undefined (undefined works as a wildcard)
 * @property {Array} default - Used when a message is created
 */



/**
 * @class Message
 * @param {String} name
 * @param {MessageFragment[]} fragments
 * @property {String} name
 */
class Message {

    constructor(name, fragments) {
        this.name = name;

        // TODO: check fragments
        this.fragments = fragments;
    }


    /**
     * Return pattern
     * @returns {Array} Array of Bytes and Function that return array of bytes
     */
    getPattern() {
        return this.fragments.reduce((pattern, val) => {
            return pattern.concat(val.pattern)
        }, []);
    }


    /**
     * Generate the raw message
     * @param {Object} [data={}] Dictionary with array of bytes
     * @returns {Number[]} Array of bytes
     */
    generateBytes(data = {}) {
        const packet = [];
        for (const fragment of this.fragments) {
            if (data[fragment.name] != undefined) {
                // Set custom value
                packet.push(...data[fragment.name]);
            } else if (fragment.default != undefined) {
                // Set default value
                if (Array.isArray(fragment.default)) {
                    packet.push(...fragment.default);
                } else if (typeof fragment.default === 'function') {
                    const defaultBytes = fragment.default({ precedent: packet });
                    packet.push(...defaultBytes);
                } else
                    throw new Error(`Invalid default value for ${fragment.name}`);
            } else {
                throw new Error(`Missing parameter ${fragment.name}`);
            }
        }
        return packet;
    }
}

module.exports = Message;