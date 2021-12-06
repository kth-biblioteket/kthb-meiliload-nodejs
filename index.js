"use strict";

require('dotenv').config();
const cron = require('node-cron');

const dbl = require('./dbl');

async function loadMeili() {
    const bunyan = require('bunyan');

    var log = bunyan.createLogger({
        name: "meiliload",
        streams: [{
            type: 'rotating-file',
            path: 'meiliload.log',
            period: '1d',
            count: 3
        }]
    });

    const ldap = require('ldapjs');
    const { MeiliSearch } = require('meilisearch')
    log.info('Started loadMeili');

    const meiliclient = new MeiliSearch({
        host: process.env.MEILI_HOST,
        apiKey: process.env.MEILI_KEY
    })

    const client = ldap.createClient({
        url: 'ldaps://ug.kth.se',
        baseDN: 'dc=ug,dc=kth,dc=se',
        username: process.env.LDAP_USER,
        password: process.env.LDAP_PWD,
        tlsOptions: {
            rejectUnauthorized: false
        }
    });

    client.bind(process.env.LDAP_USER, process.env.LDAP_PWD, (err) => {
        if (err) {
            log.info(err);
        }
    });

    client.on('error', (err) => {
        log.info(err);
    })

    const opts = {
        filter: '(&(objectCategory=User)(sAMAccountName=' + process.env.FILTER + '))',
        scope: 'sub',
        paged: { pageSize: 300, pagePause: false },
        attributes: ['sAMAccountName', 'sn', 'givenName', 'displayName', 'ugKthid',
            'ugUsername', 'mail', 'title', 'whenCreated', 'whenChanged', 'ugAffiliation', 'ugPrimaryAffiliation',
            'memberOf', 'kthPAGroupMembership']
    };

    const index = meiliclient.index('ugusers')
    if (process.env.DELETE == 'true') {
        let deletedocs = await index.deleteAllDocuments()
        log.info(deletedocs);
    }
    let count = 0;
    let ugusersjson = [];
    let regexpattern = new RegExp('^[A-Za-z0-9]+$');

    client.search('dc=ug,dc=kth,dc=se', opts, async (err, res) => {
        res.on('searchRequest', (searchRequest) => {
        });
        res.on('searchEntry', async (entry) => {
            if (entry.object.sAMAccountName) {
                count++
                if (regexpattern.test(entry.object.sAMAccountName) === false) {
                } else {
                    ugusersjson.push(entry.object)
                }
            }
        });
        res.on('searchReference', (referral) => {
        });
        res.on('error', (err) => {
            log.info(err);
        });
        res.on('end', async (result) => {
            log.info("Total count: " + count)
            const updates = []
            for (let i = 0; i < ugusersjson.length; i += parseInt(process.env.BULKSIZE)) {
                if (process.env.ADD == 'true') {
                    let meiliaddresult = await index.addDocuments(ugusersjson.slice(i, i + parseInt(process.env.BULKSIZE)))
                    log.info(meiliaddresult)
                }
                if (process.env.UPDATE == 'true') {
                    let meiliupdateresult = await index.updateDocuments(ugusersjson.slice(i, i + parseInt(process.env.BULKSIZE)))
                    log.info(meiliupdateresult)
                }
            }
            log.info('Number of users added: ' + ugusersjson.length)
            console.log(ugusersjson)
            log.info('Finished loadMeili')
            ugusersjson = []
            return;
        });
    });
}

cron.schedule(process.env.CRON, () => {
    loadMeili()
    dbl.load_dbl()
});