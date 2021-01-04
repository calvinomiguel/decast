# `process` for Sketch

All the [nodejs process](https://nodejs.org/api/process.html) API is available but some might just be stubs.

The only additional key we are setting is `type` which matches what electron is doing and its value is `sketch`. Pretty useful to create script that does different things depending on where it's running.
