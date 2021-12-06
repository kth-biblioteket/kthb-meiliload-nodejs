
pattern = /["][l][e][a][d][e][r]["][A-Za-z0-9 :"]*[,]/

require('dotenv').config();

const xml2js = require('xml2js');
fs = require('fs');
const https = require('https');

function load_dbl() {
    https.get('https://apps.lib.kth.se/dbl/xml/dbl.xml', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            return parse_dbl_xml(data)
        });
    })
        .on("error", (err) => {
            console.log("Error: " + err.message);
        });
}

async function parse_dbl_xml(dblxml) {
    const { MeiliSearch } = require('meilisearch')
    const meiliclient = new MeiliSearch({
        host: process.env.MEILI_DBL_HOST,
        apiKey: ""
    })

    const index = meiliclient.index('dbl')

    const parser = new xml2js.Parser({ attrkey: "ATTR" });

    let dbl = []
    parser.parseString(dblxml, function (error, result) {
        if (error === null) {
            let id = 0;
            result.collection.record.forEach(record => {
                dbl[id] = {}
                dbl[id].id = id;
                let publisher = ""
                let types = []
                let categories = []
                record.datafield.forEach(datafield => {
                    if (datafield.ATTR.tag == "245") {
                        datafield.subfield.forEach(subfield => {
                            if (subfield.ATTR.code == "a") {
                                dbl[id].name = subfield._;
                            }
                        })
                    }
                    if (datafield.ATTR.tag == "264") {
                        datafield.subfield.forEach(subfield => {
                            if (subfield.ATTR.code == "b") {
                                publisher += subfield._
                            }
                        })
                    }
                    if (publisher == "") {
                        if (datafield.ATTR.tag == "260") {
                            datafield.subfield.forEach(subfield => {
                                if (subfield.ATTR.code == "b") {
                                    publisher += subfield._
                                }

                            })
                        }
                    }
                    if (datafield.ATTR.tag == "520") {
                        datafield.subfield.forEach(subfield => {
                            if (subfield.ATTR.code == "a") {
                                dbl[id].description = subfield._;
                            }

                        })
                    }
                    if (datafield.ATTR.tag == "655") {
                        datafield.subfield.forEach(subfield => {
                            if (subfield.ATTR.code == "a") {
                                types.push(subfield._)
                            }

                        })
                    }
                    if (datafield.ATTR.tag == "698") {
                        datafield.subfield.forEach(subfield => {
                            if (subfield.ATTR.code == "b") {
                                categories.push(subfield._)
                            }

                        })
                    }
                    if (datafield.ATTR.tag == "856") {
                        datafield.subfield.forEach(subfield => {
                            if (subfield.ATTR.code == "u") {
                                dbl[id].link = subfield._;
                                if (dbl[id].link.indexOf('focus.lib.kth.se') > -1) {
                                    dbl[id].access = "KTH"
                                } else {
                                    dbl[id].access = "Free"
                                }
                            }

                        })
                    }
                });
                if (!dbl[id].access) {
                    dbl[id].access = "Saknas"
                }
                if (!dbl[id].link) {
                    dbl[id].link = "Saknas"
                }
                dbl[id].startletter = dbl[id].name.substr(0, 1).toUpperCase();
                dbl[id].publisher = publisher;
                dbl[id].types = types;
                dbl[id].categories = categories;
                id++
            });
        }
        else {
            console.log(error);
        }
    });
    
    let meiliaddresult = await index.updateDocuments(dbl)

    const bunyan = require('bunyan');

    var log = bunyan.createLogger({
        name: "meililoaddbl",
        streams: [{
            type: 'rotating-file',
            path: 'meililoaddbl.log',
            period: '1d',
            count: 3
        }]
    });

    log.info(meiliaddresult)
                 
    
}

module.exports = { load_dbl }