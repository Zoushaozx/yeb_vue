let proxyObj = {} // 代理对象

proxyObj['/'] = {  //所有/都进行代理
    // websocket
    ws: false,
    // 代理目标地址
    target: 'http://localhost:8081',
    // 发送请求头 host 会被设置 target
    changeOrigin: true,  //target参数是域名
    // 不重写请求地址
    pathRewrite: {
        '^/': '/'
    }
}

// 在线聊天 代理
proxyObj['/ws'] = {
    ws: true,
    target: 'ws://localhost:8081'
}


// 访问的默认的路径和端口
module.exports = { 
    devServer: {
        host: 'localhost',
        port: 8080,
        proxy: proxyObj // 代理
    }
}
