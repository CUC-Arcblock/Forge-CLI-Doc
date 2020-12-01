/* eslint-disable no-console */
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const http = require('http');
const serveStatic = require('serve-static');
const { URL } = require('url');
//获取地址的常量
const { ABT_NETWORKS_PATH, ABT_NETWORKS_URL } = require('../../../constant');

const getRemoteNetworks = async () => {
  const networks = [];
  try {
    //尝试在ABT_NETWORKS_URL中获得network data
    const { data } = await axios.get(ABT_NETWORKS_URL, { timeout: 10 * 1000 });
    if (Array.isArray(data)) {
      networks.push(...data);
    }
  } catch (error) {
    console.log(error);
  }

  return networks;
};

//尝试获得ABT_NETWORKS_PATH的内容，并将remote network中获取的内容与其合并。并设置response的header等信息。
const responseNetworks = res => {
  try {
    const tmp = fs
      .readFileSync(ABT_NETWORKS_PATH)
      .toString()
      .trim();

    const networks = tmp ? JSON.parse(tmp) : [];
    getRemoteNetworks().then(remoteNetworks => {
      networks.push(...remoteNetworks);

      //设置回复的信息
      res.setHeader('content-type', 'text/javascript');
      res.write(`window.ARCBLOCK_NETWORKS=${JSON.stringify(networks)}`);
      res.end();
    });
  } catch (error) {
    console.log('response networks.js failed', error);
    res.end();
  }
};

const filesPath = path.join(__dirname, '../../../../node_modules/@arcblock/forge-web');
const serve = serveStatic(filesPath, {
  index: ['index.html', 'index.htm'],
});
//创建http服务器，根据url的不同提供不同的服务。若url为空，则返回index页面；若url为network.js则调用函数responseNetworks来进行处理，返回经过函数②处理后的response信息。
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, `http:${req.headers.host}`);
    if (url.pathname === '/dashboard') {
      req.url = `/${url.search}`;
    }

    if (req.url === '/static/js/networks.js') {
      return responseNetworks(res);
    }
  } catch (error) {
    console.error(error);
  }

  return serve(req, res, () => {
    res.write(fs.readFileSync(path.join(filesPath, 'index.html')).toString());
    res.end();
  });
});
//server进行监听
server.listen(process.env.FORGE_WEB_PROT);
