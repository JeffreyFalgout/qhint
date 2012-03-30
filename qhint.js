(function() {
    var qHint =
        window.jsHintTest =
        window.qHint =
            function qHint(name, sourceFile, options) {
                if (sourceFile === undefined || typeof(sourceFile) == "object") {
                    // jsHintTest('file.js', [options])
                    options = sourceFile;
                    sourceFile = name;
                }

                return asyncTest(name, function() {
                    qHint.sendRequest(sourceFile, function(req) {
                        start();

                        if (req.status == 200) {
                            qHint.validateFile(req.responseText, options);
                        } else {
                            ok(false, "HTTP error " + req.status +
                                      " while fetching " + sourceFile);
                        }
                    });
                });
            };

    qHint.validateFile = function (source, options) {
        var i, len, err,
            result,
            showUnused, unused, unvar;

        if (options && options.unused) {
            showUnused = true;
            delete options.unused;
        }

        result = JSHINT(source, options);

        if (showUnused) {
            unused = JSHINT.data().unused;
        }

        if (result && !unused) {
            ok(true);
            return;
        }

        for (i = 0, len = JSHINT.errors.length; i < len; i++) {
            err = JSHINT.errors[i];
            if (!err) {
                continue;
            }

            ok(false, err.reason +
                " on line " + err.line +
                ", character " + err.character);
        }

        if (unused) {
            for (i = 0, len = unused.length; i < len; i++) {
                unvar = unused[i];
                ok(false, "unused variable " + unvar.name +
                          " on line " + unvar.line);
            }
        }
    };

    var XMLHttpFactories = [
        function () { return new XMLHttpRequest(); },
        function () { return new ActiveXObject("Msxml2.XMLHTTP"); },
        function () { return new ActiveXObject("Msxml3.XMLHTTP"); },
        function () { return new ActiveXObject("Microsoft.XMLHTTP"); }
    ];

    function createXMLHTTPObject() {
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                return XMLHttpFactories[i]();
            } catch (e) {}
        }
        return false;
    }

    // modified version of XHR script by PPK
    // http://www.quirksmode.org/js/xmlhttp.html
    // attached to qHint to allow substitution / mocking
    qHint.sendRequest = function (url, callback) {
        var req = createXMLHTTPObject();
        if (!req) {
            return;
        }

        var method = "GET";
        req.open(method,url,true);
        req.onreadystatechange = function () {
            if (req.readyState != 4) {
                return;
            }

            callback(req);
        };

        if (req.readyState == 4) {
            return;
        }
        req.send();
    };
})();
