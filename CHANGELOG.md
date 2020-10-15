v1.0.2 (Oct 15, 2020)
* Fixed spaces around variables and arguments in Python codgen to comply with PEP 8.
* Added Content-Length header to generated HTTP snippets.
* Switched to multiline strings for Raw bodies in Go.
* Stopped manually encoding response bodes in `utf8` for Python-requests.
* Removed unnecessary semicolons at the end of statements in Ruby.
* Fixed wrong name of HTTP codegen in README
* Use multiline strings for GraphQL queries in all NodeJS codegens.
* Signal semaphore in the fail case in Swift to prevent deadlock.
* Use quotes consistently in NodeJs-request.

v1.0.1 (Jun 29, 2020)
- Fix for - [8674](https://github.com/postmanlabs/postman-app-support/issues/8674): Add URL sanitization for quotes in cURL, Java Unirest, NodeJS Native, Python http.client, and Swift. 

v1.0.0 (May 29, 2020)
- Add axios framework support
- Add ES6 syntax support for NodeJS Request, NodeJS Native and NodeJS Unirest
- Fix snippet generation for powershell and jquery, where form data params had no type field