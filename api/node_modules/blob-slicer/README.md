# blob-slicer
[![Build Status][travis-image]][travis-url]
[![npm][npm-image]][npm-url]
[![JavaScript Style Guide][standard-image]][standard-url]


[travis-image]: https://travis-ci.org/Merzouqi/blob-slicer.svg?branch=master
[travis-url]: https://travis-ci.org/Merzouqi/blob-slicer
[npm-image]: https://img.shields.io/npm/v/blob-slicer.svg
[npm-url]: https://npmjs.org/package/blob-slicer
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

Read all or part of the content in a [Blob][blob-url] or [File][file-url] as a [Buffer][buffer-url] or [Stream][stream-url]

[blob-url]: https://developer.mozilla.org/en-US/docs/Web/api/Blob
[file-url]: https://developer.mozilla.org/en-US/docs/Web/api/File
[buffer-url]: https://www.npmjs.com/package/buffer/v/4.9.1
[stream-url]: https://www.npmjs.com/package/readable-stream/v/2.3.6

## Install

```
npm install blob-slicer
```

## Usage

```javascript
var BlobSlicer = require('blob-slicer')

var reader = new BlobSlicer(getBlobOrFileSomehow())

// Read as Buffer
reader.read(start, end, function (error, buffer) {
  if (error) {
    // handle error
  }
  // handle data
})

// Read as Stream
reader.createReadStream()
  .on('data', function (chunk) { ... })
  .on('error', function (error) { ... })
  .on('end', function () { ... })
```
blob-slicer depends on buffer v4.x . Therefore, if you are using browserify v14 and higher, you must include buffer v4
instead of the default v5 by either doing :
```
browserify -r buffer/:buffer main.js -o bundle.js
```
or
```javascript
browserify().require(require.resolve('buffer/'), { expose: 'buffer' })
```

## API

**Class: BlobSlicer**

**new BlobSlicer(blob)**\
Throws error if blob is not an instance of Blob or File.

**blobSlicer.read([start], [end], callback)**\
Read a range of bytes delimited by *start*(inclusive) and *end*(exclusive).\
If *end* is not specified, it reads all bytes from *start* to the end of blob.\
If *start* and *end* are not specified, it reads all data in the blob.\
The callback is passed two arguments `(err: Error, buf: Buffer)`.

**blobSlicer.createReadStream([options])**\
`options` may be omitted, the default is `{highWaterMark: 64 * 1024, start: 0, end: blob.size}`.\
`options.start` is inclusive, `options.end` is exclusive.\
Return an instance of `ReadStream`.

**Class: ReadStream**

An implementation of [Readable Streams](https://nodejs.org/dist/latest-v8.x/docs/api/stream.html#stream_class_stream_readable).

**readStream.readableLength: number**\
same as in [stream_readable_readablelength](https://nodejs.org/dist/latest-v10.x/docs/api/stream.html#stream_readable_readablelength)

**readStream.ended: boolean**\
`true` if reached the end of blob (there may be still some bytes in the queue ready to be consumed).

## License

MIT. Copyright (c) Hoummad Merzouqi.
