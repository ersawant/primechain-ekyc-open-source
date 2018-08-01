const crypto = require("crypto");
const randomString = require("randomstring");
const url = require('url');

module.exports.hex2bin = function (hex) {
    return Buffer.from(hex, 'hex');
}

module.exports.bin2hex = function (bin) {
    return Buffer.from(bin).toString('hex');
}

module.exports.hex2str = function (hex) {
    return Buffer.from(hex, 'hex').toString('utf-8');
}

module.exports.str2hex = function (str) {
    return Buffer.from(str).toString('hex');
}

module.exports.json2hex = function (json) {
    return this.str2hex(JSON.stringify(json));
}

module.exports.json2str = function (json) {
    return JSON.stringify(json);
}

module.exports.str2json = function (json) {
    return JSON.parse(json);
}

module.exports.hex2json = function (hex) {
    let data = this.hex2str(hex);
    try {
        return JSON.parse(data);
    }
    catch (ex) {
        return data;
    }
}

module.exports.getDocumentHash = function (documentData) {
    return crypto.createHash('sha256').update(documentData).digest('hex');
}

module.exports.generateRandomBytes = function (size) {
    return crypto.randomBytes(size);
}

module.exports.generateRandomString = function (size) {
    return randomString.generate(size);
}

module.exports.encrypt = function (text, key) {
    var cipher = crypto.createCipheriv("aes-256-ctr", key)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

module.exports.encryptiv = function (text, password, iv) {
    var cipher = crypto.createCipheriv('aes-256-gcm', password, iv);
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    var tag = cipher.getAuthTag();
    var enctyptedData = {
        content: encrypted,
        tag: this.bin2hex(tag)
    };
    return enctyptedData;
}

module.exports.decryptiv = function (encrypted, password, iv) {
    var decipher = crypto.createDecipheriv('aes-256-gcm', password, iv);
    decipher.setAuthTag(this.hex2bin(encrypted.tag));
    var decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports.decrypt = function (text, key) {
    var decipher = crypto.createDecipheriv("aes-256-ctr", key)
    var decrypted = decipher.update(text, 'hex', 'utf8')
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports.randomAplhaNumber = function (size) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        result = ""
    for (var i = 0; i < size; ++i)
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

module.exports.randomNDigitNumber = function (size) {
    var r = (Math.random() * Math.pow(10, size)).toFixed(0);
    while (r.length != size)
        r = "0" + r;
    return r;
}
module.exports.isLoggedIn = function (req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports.parseUrl = function (urlStr) {
    return url.parse(urlStr);
}

module.exports.refererPathExtractor = function (req) {
    // Escaping user input to be treated as a literal 
    // string within a regular expression accomplished by 
    // simple replacement
    function escapeRegExp(str) {
        return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
    }
    // Replace utility function
    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    }
    if (req.headers && req.method == "POST") {
        return this.parseUrl(req.headers['referer']).path;
    }
    else {
        return replaceAll(req.get('referer'), req.get('origin'), '');
    }
}