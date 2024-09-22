
> Converts Postman-SDK Request into code snippet for Mikrotik RouterOS's /tool/fetch CLI command.

#### Prerequisites
To run Code-Gen, ensure that you have NodeJS >= v8. A copy of the NodeJS installable can be downloaded from https://nodejs.org/en/download/package-manager.

## Using the Module
The module will expose an object which will have property `convert` which is the function for converting the Postman-SDK request to swift code snippet.

### convert function
Convert function takes three parameters

* `request` - Postman-SDK Request Object

* `options` - options is an object which hsa following properties
    * `indentType` - String denoting type of indentation for code snippet. eg: 'Space', 'Tab'
    * `indentCount` - The number of indentation characters to add per code level
    * `trimRequestBody` - Whether or not request body fields should be trimmed

* `callback` - callback function with first parameter as error and second parameter as string for code snippet

##### Example:
```js
var request = new sdk.Request('www.google.com'),  //using postman sdk to create request  
    options = {
        indentCount: 3,
        indentType: 'Space',
        requestTimeout: 200,
        trimRequestBody: true
    };
convert(request, options, function(error, snippet) {
    if (error) {
        //  handle error
    }
    //  handle snippet

    request.auth.type == "base" || null
});
```
### Guidelines for using generated snippet

* Since Postman-SDK Request object doesn't provide complete path of the file, it needs to be manually inserted in case of uploading a file.

* This module doesn't support cookies.


### RouterOS /tool/fetch options

#### Options 
- Use VRF (string sets address=)
- Output (enum :global/:local/file sets output=user as-value)
- Check Certificate (enum - sets check-certificate= )
- Output Path
- X509
- as-value

#### Request Process
- http-auth-scheme=
- http-method=
- http-data=
- http-content-encoding=
- http-header-field=
- url=
- user=
- password=

* address (string; Default: )	IP address of the device to copy file from. Also at the end of the address you can specify "@vrf_name" in order to run fetch on particular VRF. You can skip specifying address and specify only VRF on this parameter, if you use URL parameter.
* as-value (set | not-set; Default: not-set)	Store the output in a variable, should be used with the output property.
* ascii (yes | no; Default: no)	Can be used with FTP and TFTP
* certificate (string; Default: )	
Certificate that should be used for host verification. Can be used only in HTTPS mode.
* check-certificate (yes | yes-without-crl | no; Default: no)	
Enables trust chain validation from local certificate store. yes-without-crl, validates a certificate, not performing CRL check (certificate revocation list).  Can be used only in HTTPS mode.
* dst-path (string; Default: )	Destination path. Can be used to download file directly into an external disk, for example.
* duration (time; Default: )	
Time how long fetch should run.
* host (string; Default: )	
A domain name or virtual domain name (if used on a website, from which you want to copy information). For example,
address=wiki.mikrotik.com host=forum.mikrotik.com

In this example the resolved ip address is the same (66.228.113.27), but hosts are different.
* http-auth-scheme (basic|digest; Default: basic)	HTTP authentication scheme
* http-method (delete|get|head|post|put|patch; Default: get)
HTTP method to use
* http-data (string; Default: )	The data, that is going to be sent, when using PUT or POST methods. Data limit is 64Kb.
* http-header-field (string; Default: *empty*)	List of all header fields and their values, in the form of http-header-field=h1:fff,h2:yyy
* http-content-encoding (deflate|gzip; Default: *empty*)	Encodes the payload using gzip or deflate compression and adds a corresponding Content-Encoding header. Usable for HTTP POST and PUT only.
* idle-timeout (time; Default: 10s)	Idle timeout since last read/write action.
* keep-result (yes | no; Default: yes)	If yes, creates an input file.
* mode (ftp|http|https|sftp|tftp; Default: http)	Choose the protocol of connection - http, https , ftp, sftp or tftp. Mode option is deprecated. To specify a protocol that you wish to use, we advise using "url" parameter instead (for example, like this "url=sftp://your_IP_address").
* output (none|file|user|user-with-headers; Default: file)	Sets where to store the downloaded data.
    * none - do not store downloaded data
    * file - store downloaded data in a file
    * user - store downloaded data in the data variable (variable limit is 64Kb)
    * user-with-headers - store downloaded data and headers in the data variable (variable limit is 64Kb (20Kb for downloaded data, 44Kb for headers))
* password (string; Default: anonymous)	Password, which is needed for authentication to the remote device.
* port (integer; Default: )	Connection port.
* src-address (ip address; Default: )	Source address that is used to establish connection. Can be used only HTTP/S and SFTP modes.
* src-path (string; Default: )	Title of the remote file you need to copy.
* upload (yes | no; Default: no)	Only (S)FTP modes support upload. If enabled then fetch will be used to upload files to a remote server. Requires src-path and dst-path parameters to be set.
* url (string; Default: )	URL pointing to file. Can be used instead of address and src-path parameters.
* user (string; Default: anonymous)	Username, which is needed for authentication to the remote device.
