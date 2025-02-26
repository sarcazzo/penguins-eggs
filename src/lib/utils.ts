/**
 * penguins-eggs: utils.js 
 * 
 * author: Piero Proietti
 * mail: piero.proietti@gmail.com
 */

"use strict";

import shell from "shelljs";
import ip from "ip";
import fs from "fs";
import os from "os";
import dns from "dns";
import network from "network";
import path from "path";

/**
 * utils
 */
class utils {

  async isLive(): Promise<Boolean> {
    let test: string = "1";
    let result: any;
    result = shell.exec(`${__dirname}/../../scripts/is_live.sh`, {
      async: false
    });
    if (result.indexOf(test) > -1) {
      return true;
    } else {
      return false;
    }
  }
  isRoot(): Boolean {
    return process.getuid && process.getuid() === 0;
  }

  async isMounted(check: string): Promise<boolean> {
    let test: string = "1";
    let result: any;
    result = shell.exec(`${__dirname}/../../scripts/is_mounted.sh ${check}`, {
      async: false
    });
    if (result.indexOf(test) > -1) {
      return true;
    } else {
      return false;
    }
  }

  netNetmask(): string {
    let netMask: string = "";
    let ifaces: any = os.networkInterfaces();

    Object.keys(ifaces).forEach(function (ifname) {
      ifaces[ifname].forEach(function (iface: any) {
        if ("IPv4" !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
        netMask = iface.netmask;
      });
    });
    return netMask;
  }

  netDomainName(): string {
    return "lan";
  }

  netDns(): string {
    return "192.168.61.1"; // dns.getServers()[0];
  }

  netGateway(): string {
    let ip: string;
    let err: any;
    network.get_gateway_ip(function (err: any, ip: string) {
      //console.log(err || ip); // err may be 'No active network interface found.'
    });
    return ip;
  }

  netBootServer(): string {
    return ip.address();
  }

  netDeviceName(): string {
    let interfaces: any = Object.keys(os.networkInterfaces());
    let netDeviceName: string = "";
    for (let k in interfaces) {
      if (interfaces[k] != "lo") {
        netDeviceName = interfaces[k];
      }
    }
    return netDeviceName;
  }

  kernerlVersion(): string {
    return os.release();
  }

  bashWrite(file: string, text: string): void {
    const head: string = 
    `########################################################START##\n# penguins-eggs: ${path.basename(file.trim())}\n###############################################################\n`;
    const footer: string = `######################################################## END ##
    `;

    console.log(`[utils]\n>>> Creazione ${file}`);
    text = head + text.trim() + "\n" + footer;
    text = text.trim() + "\n";
    file = file.trim();
    fs.writeFileSync(file, text);
    console.log(text);
    console.log(`>>> Fine creazione ${file}  ===`);
  }

  exec(cmd: string): void {
    console.log(`[utils] >>> exec ${cmd}`);
    shell.exec(cmd, { async: false });
  }

  rsync(commands: Array<string>): void {
    console.log(commands);
    console.log(`[utils] >>> ${commands}`);
    commands.forEach(function (cmd: string) {
      // Questa riga, mandava rsync in async...
      //const { stdout, stderr, code } =  shell.exec(cmd, { silent: true });
      //console.log(`[utils] >>> exec ${cmd}`);
      shell.exec(cmd, {
        async: false
      });
    });
  }

  sr(file: string, search: string, replace: string): void {
    let original: string = fs.readFileSync(file).toString();
    let changed: string = original.replace(search, replace);
    fs.writeFileSync(file, changed);
  }

  hostname(target: string, hostname: string): void {
    let file: string = `${target}/etc/hostname`;
    let text: string = hostname;
    fs.writeFileSync(file, text);
  }

  date4label(): string {
    let d: Date = new Date();
    let tz: number;
    let ver: string =
      pad(d.getFullYear()) +
      "/" +
      pad(d.getMonth() + 1) +
      "/" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes());

    let sign: string = "+";
    if (d.getTimezoneOffset() < 0) {
      sign = "-";
    }

    tz = Math.abs(d.getTimezoneOffset() / 60);
    ver += sign + pad(tz);
    return ver;
  }

  date4file() {
    let d: Date = new Date();
    let tz: number;
    let ver: String =
      "_" +
      pad(d.getFullYear()) +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "_" +
      pad(d.getHours()) +
      pad(d.getMinutes());

    let sign: string = "+";
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
  net(ip: string, sm: string): string {
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
function intToQdot(integer: number) {
  return [
    (integer >> 24) & MAX_BIT_BIN,
    (integer >> 16) & MAX_BIT_BIN,
    (integer >> 8) & MAX_BIT_BIN,
    integer & MAX_BIT_BIN
  ].join(".");
}

/**
 * Converts an IP/Submask into 32 bit int
 *
 * @param {Array.<string>} a quad-dotted IPv4 address -> array
 * @return {number} a 32-bit integer representation of an IPv4 address
 */
function qdotToInt(ip: Array<string>) {
  var x = 0;

  x += (+ip[0] << 24) >>> 0;
  x += (+ip[1] << 16) >>> 0;
  x += (+ip[2] << 8) >>> 0;
  x += +ip[3] >>> 0;

  return x;
}

function pad(number: number) {
  if (number < 10) {
    return "0" + number;
  }
  return number;
}


export default new utils();
