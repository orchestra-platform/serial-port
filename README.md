<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [MessagesManager][1]
    -   [Parameters][2]
    -   [getMessage][3]
        -   [Parameters][4]
    -   [getMessages][5]
        -   [Parameters][6]
    -   [recognizeMessage][7]
        -   [Parameters][8]
-   [Buffer][9]
    -   [Parameters][10]
    -   [Properties][11]
    -   [handleData][12]
        -   [Parameters][13]
    -   [\_removeFromByteBuffer][14]
        -   [Parameters][15]
    -   [subscribe][16]
        -   [Parameters][17]
    -   [readMessage][18]
        -   [Parameters][19]
-   [Message][20]
    -   [Parameters][21]
    -   [Properties][22]
    -   [getPattern][23]
    -   [generateBytes][24]
        -   [Parameters][25]
-   [MessageFragment][26]
    -   [Properties][27]

## MessagesManager

### Parameters

-   `messages` **[Array][28]&lt;[Message][29]>** 

### getMessage

#### Parameters

-   `name` **[String][30]** Message name

### getMessages

#### Parameters

-   `names` **[Array][28]&lt;[String][30]>** Array of message names

### recognizeMessage

Recognize a message from an array of bytes

#### Parameters

-   `bytes` **[Array][28]** 
-   `messages` **[Array][28]&lt;[Message][29]>** 

Returns **[Boolean][31]** Returns false if no message is found

Returns **[Object][32]** Returns an Object {type,bytes,values} if a message is found

## Buffer

### Parameters

-   `options` **[Object][32]** 
    -   `options.isMessageStart` **[Object][32]** 
    -   `options.recognizeMessage` **[Object][32]** Function that recognize a message from an array of bytes, it must return false or an Object with a property 'type'
-   `readMessageTimeout` **[Number][33]?** The value of Buffer.readMessageTimeout

### Properties

-   `readMessageTimeout` **[Number][33]** Time (in milliseconds) after which readMessage will throw an error if no data is received

### handleData

Functions that receive chunks of data and recognize the messages

#### Parameters

-   `data` **[Array][28]&lt;[Number][33]>** 

### \_removeFromByteBuffer

Removes N bytes from the buffer

#### Parameters

-   `n` **[Number][33]** Number of bytes to be removed. With n=-1 it emptys the buffer

### subscribe

Subscribe to a message

#### Parameters

-   `options` **[Object][32]** 
    -   `options.msg` **[Message][29]** Message
    -   `options.once` **[Boolean][31]**  (optional, default `true`)
    -   `options.all` **[Boolean][31]**  (optional, default `false`)
    -   `options.callback` **[Function][34]** 

Returns **[Function][34]** unsubscribe callback

### readMessage

Read a message from the serialport

#### Parameters

-   `msg` **[String][30]** Message

Returns **[Message][29]** message

## Message

### Parameters

-   `name` **[String][30]** 
-   `fragments` **[Array][28]&lt;[MessageFragment][35]>** 

### Properties

-   `name` **[String][30]** 

### getPattern

Return pattern

Returns **[Array][28]** Array of Bytes and Function that return array of bytes

### generateBytes

Generate the raw message

#### Parameters

-   `data` **[Object][32]** Dictionary with array of bytes (optional, default `{}`)

Returns **[Array][28]&lt;[Number][33]>** Array of bytes

## MessageFragment

Message Fragment

Type: [Object][32]

### Properties

-   `name` **[String][30]** Name of the fragment
-   `desc` **[String][30]?** Description of the fragment
-   `pattern` **[Array][28]** Array of bytes, function or undefined (undefined works as a wildcard)
-   `default` **[Array][28]** Used when a message is created

[1]: #messagesmanager

[2]: #parameters

[3]: #getmessage

[4]: #parameters-1

[5]: #getmessages

[6]: #parameters-2

[7]: #recognizemessage

[8]: #parameters-3

[9]: #buffer

[10]: #parameters-4

[11]: #properties

[12]: #handledata

[13]: #parameters-5

[14]: #_removefrombytebuffer

[15]: #parameters-6

[16]: #subscribe

[17]: #parameters-7

[18]: #readmessage

[19]: #parameters-8

[20]: #message

[21]: #parameters-9

[22]: #properties-1

[23]: #getpattern

[24]: #generatebytes

[25]: #parameters-10

[26]: #messagefragment

[27]: #properties-2

[28]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array

[29]: #message

[30]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[31]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[32]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[33]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[34]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[35]: #messagefragment
