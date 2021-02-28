import axios from 'axios'

const service = axios.create({
    responseType: 'arraybuffer'
})

service.interceptors.request.use(config => {
    config.headers['Authorization'] = window.sessionStorage.getItem('tokenStr');
    return config;
}, error => {
    console.log(error);
})

service.interceptors.response.use(resp => {
    const headers = resp.headers;
    let reg = RegExp(/application\/json/);
    if (headers['content-type'].match(reg)) {
        resp.data = unitToString(resp.data);
    } else {
        //使用 js-file-down
        let fileDownload = require('js-file-download');
        //获取名字
        let fileName = headers['content-disposition'].split(';')[1].split('filename=')[1];
        //响应类型
        let contentType = headers['content-type'];
        //转码，防止中文乱码
        fileName = decodeURIComponent(fileName);
        //通过js-file-down 插件下载文件
        fileDownload(resp.data, fileName, contentType);

    }
}, error => {
    console.log(error);

})
function unitToString(uintArray) {
    //编码
    let encodedString = String.fromCharCode.apply(null, new Uint8Array(uintArray));
    //解码
    let decodedString = decodeURIComponent(escape(encodedString));
    return JSON.parse(decodedString);
}

let base = '';
export const downloadRequest = (url, params) => {
    return service({
        method: 'get',
        url: `${base}${url}`,
        data: params
    })
}
export default service;