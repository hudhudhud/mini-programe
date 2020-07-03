const CryptoJS = require('crypto-js')
const util = require('./util.js')
function encriUser(){
    let iv = "0000000000000000";
    // 加密内容
    let word =wx.getStorageSync("userInfo").userId+'|'+util.formatTime(new Date())
    // 密钥，长度必须为16
    let secret_key = "1234567890123456";

    // utf-8 转换
    word = CryptoJS.enc.Utf8.parse(word);
    secret_key = CryptoJS.enc.Utf8.parse(secret_key);
    iv = CryptoJS.enc.Utf8.parse(iv);

    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(word, secret_key, { 
        iv: iv,
        mode: CryptoJS.mode.CBC, 
        padding: CryptoJS.pad.Pkcs7
    });
    wx.setStorageSync('uid-enc',ciphertext.toString())
    console.log(999999999,ciphertext.toString())
}
function encriId(id){
    let iv = "0000000000000000";
    // 加密内容
    let word=id+'|'+util.formatTime(new Date())
    // 密钥，长度必须为16
    let secret_key = "1234567890123456";

    // utf-8 转换
    word = CryptoJS.enc.Utf8.parse(word);
    secret_key = CryptoJS.enc.Utf8.parse(secret_key);
    iv = CryptoJS.enc.Utf8.parse(iv);

    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(word, secret_key, { 
        iv: iv,
        mode: CryptoJS.mode.CBC, 
        padding: CryptoJS.pad.Pkcs7
    });
    return ciphertext.toString()
}
export {encriUser,encriId}