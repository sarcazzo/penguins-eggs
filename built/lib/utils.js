/*
  penguins-eggs: utils.js
  author: Piero Proietti
  mail: piero.proietti@gmail.com
*/
"use strict";

var __importDefault = undefined && undefined.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = __importDefault(require("shelljs"));
const ip_1 = __importDefault(require("ip"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const network_1 = __importDefault(require("network"));
const path_1 = __importDefault(require("path"));
class utils {
    constructor() {
        this.pathScripts = "/usr/lib/node_modules/penguins-eggs";
    }
    //pathScripts: String = "/home/artisan/penguins-eggs";
    // metodi
    path() {
        return this.pathScripts;
    }
    async isLive() {
        let test = "1";
        let result;
        result = shelljs_1.default.exec(`${this.pathScripts}/scripts/is_live.sh`, {
            async: false
        });
        if (result.indexOf(test) > -1) {
            return true;
        } else {
            return false;
        }
    }
    isRoot() {
        return process.getuid && process.getuid() === 0;
    }
    async isMounted(check) {
        let test = "1";
        let result;
        result = shelljs_1.default.exec(`${this.pathScripts}/scripts/is_mounted.sh ${check}`, {
            async: false
        });
        if (result.indexOf(test) > -1) {
            return true;
        } else {
            return false;
        }
    }
    netNetmask() {
        let netMask = "";
        let ifaces = os_1.default.networkInterfaces();
        Object.keys(ifaces).forEach(function (ifname) {
            ifaces[ifname].forEach(function (iface) {
                if ("IPv4" !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                netMask = iface.netmask;
            });
        });
        return netMask;
    }
    netDomainName() {
        return "lan";
    }
    netDns() {
        return "192.168.61.1"; // dns.getServers()[0];
    }
    netGateway() {
        let ip;
        let err;
        network_1.default.get_gateway_ip(function (err, ip) {
            //console.log(err || ip); // err may be 'No active network interface found.'
        });
        return ip;
    }
    netBootServer() {
        return ip_1.default.address();
    }
    netDeviceName() {
        let interfaces = Object.keys(os_1.default.networkInterfaces());
        let netDeviceName = "";
        for (let k in interfaces) {
            if (interfaces[k] != "lo") {
                netDeviceName = interfaces[k];
            }
        }
        return netDeviceName;
    }
    kernerlVersion() {
        return os_1.default.release();
    }
    bashWrite(file, text) {
        const head = `########################################################START##
    # Generated by Egg ${path_1.default.basename(file.trim())}
    ###############################################################\n`;
        const footer = `######################################################## END ##
    `;
        console.log(`[utils]\n>>> Creazione ${file}`);
        text = head + text.trim() + "\n" + footer;
        text = text.trim() + "\n";
        file = file.trim();
        fs_1.default.writeFileSync(file, text);
        console.log(text);
        console.log(`>>> Fine creazione ${file}  ===`);
    }
    exec(cmd) {
        console.log(`[utils] >>> exec ${cmd}`);
        shelljs_1.default.exec(cmd, { async: false });
    }
    rsync(commands) {
        console.log(commands);
        console.log(`[utils] >>> ${commands}`);
        commands.forEach(function (cmd) {
            // Questa riga, mandava rsync in async...
            //const { stdout, stderr, code } =  shell.exec(cmd, { silent: true });
            //console.log(`[utils] >>> exec ${cmd}`);
            shelljs_1.default.exec(cmd, {
                async: false
            });
        });
    }
    sr(file, search, replace) {
        let original = fs_1.default.readFileSync(file).toString();
        let changed = original.replace(search, replace);
        fs_1.default.writeFileSync(file, changed);
    }
    hostname(target, hostname) {
        let file = `${target}/etc/hostname`;
        let text = hostname;
        fs_1.default.writeFileSync(file, text);
    }
    date4label() {
        let d = new Date();
        let tz;
        let ver = pad(d.getFullYear()) + "/" + pad(d.getMonth() + 1) + "/" + pad(d.getDate()) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
        let sign = "+";
        if (d.getTimezoneOffset() < 0) {
            sign = "-";
        }
        tz = Math.abs(d.getTimezoneOffset() / 60);
        ver += sign + pad(tz);
        return ver;
    }
    date4file() {
        let d = new Date();
        let tz;
        let ver = "_" + pad(d.getFullYear()) + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes());
        let sign = "+";
        if (d.getTimezoneOffset() < 0) {
            sign = "-";
        }
        tz = Math.abs(d.getTimezoneOffset() / 60);
        ver += sign + pad(tz);
        return ver;
    }
    /**
    *
    * Funzioni interne: calcolo rete; copiate da ipcalc
    *
    */
    /**
     * ANDs 32 bit representations of IP and submask to get network address
     *
     * @param {number} 32 bit representation of IP address
     * @param {number} 32 bit representation of submask
     * @return {number} 32 bit representation of IP address (network address)
     */
    net(ip, sm) {
        let _ip = qdotToInt(ip.split("."));
        let _sm = qdotToInt(sm.split("."));
        return intToQdot(_ip & _sm);
    }
}
var MAX_BIT_BIN = 255;
/**
 * Reverses function qdotToInt(ip)
 *
 * @param {number} a 32-bit integer representation of an IPv4 address
 * @return {string} a quad-dotted IPv4 address
 */
function intToQdot(integer) {
    return [integer >> 24 & MAX_BIT_BIN, integer >> 16 & MAX_BIT_BIN, integer >> 8 & MAX_BIT_BIN, integer & MAX_BIT_BIN].join(".");
}
/**
 * Converts an IP/Submask into 32 bit int
 *
 * @param {Array.<string>} a quad-dotted IPv4 address -> array
 * @return {number} a 32-bit integer representation of an IPv4 address
 */
function qdotToInt(ip) {
    var x = 0;
    x += +ip[0] << 24 >>> 0;
    x += +ip[1] << 16 >>> 0;
    x += +ip[2] << 8 >>> 0;
    x += +ip[3] >>> 0;
    return x;
}
function pad(number) {
    if (number < 10) {
        return "0" + number;
    }
    return number;
}
exports.default = new utils();
//# sourceMappingURL=utils.js.map