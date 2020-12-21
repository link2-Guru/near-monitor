const axios = require('axios');
const _ = require('lodash');
const fs = require('fs');
const redis = require('./redis');

const rKey = "iplist";

async function networkInfo() {
    const config = {
        method: 'post',
        url: 'https://rpc.mainnet.near.org',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            "jsonrpc": "2.0", "id": "dontcare",
            "method": "network_info", "params": []
        })
    };
    const { data } = await axios(config)
    // console.log('response', data)

    return _.get(data, "result.active_peers", [])
}

async function getBlock(url) {
    console.log('getBlock', `${url}:3030`)
    const config = {
        method: 'post',
        url: `http://${url}:3030`,
        timeout: 3000,
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ "jsonrpc": "2.0", "id": "dontcare", "method": "block", "params": { "finality": "final" } })
    };

    const { data } = await axios(config)
    console.log('getBlock:data', data)
    return _.get(data, "result", false) 

}

async function mian() {
    try {

        // mainnet
        redis.sadd(rKey, `https://rpc.mainnet.near.org`)

        const arr = []
        const networkList = await networkInfo();
        console.log('networkList', networkList)
        if (networkList.length) {
            for (let index = 0; index < networkList.length; index++) {
                const element = networkList[index];
                if (element.addr) {
                    const ip = element.addr.split(":")[0]
                    try {
                        const block = await getBlock(ip)
                        if (block) {
                            //console.log('block', block)
                            // arr.push({
                            //     host:`http://${ip}:3030`,
                            //     author:_.get(block,"result.author"),
                            //     height:_.get(block,"result.header.height")
                            // })

                           //  arr.push(`http://${ip}:3030`)
                           redis.sadd(rKey, `http://${ip}:3030`)
                        }
                    } catch (error) {
                        console.log('error', error)
                        continue;
                    }
                }

            }
            // console.log('arr', arr)
            // fs.writeFileSync("data/ip.json", JSON.stringify({ data: arr }))

            console.log('end')
        }
    } catch (error) {
        console.log('error', error)
    }

}

//

//getBlock()

// networkInfo()

mian()
setInterval(() => {
    mian()
}, 1000 * 60 * 10);