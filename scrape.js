//models & data
const model_result = require('./data/model_result')
const blacklisted_domains = require('./data/domain_blacklist.json')

//modules
const fetch = require('node-fetch')
const {JSDOM} = require('jsdom')

require('dotenv').config()

const mongoose =  require('mongoose');
mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGO, {
}).then(() => {
    console.log("connected with the database")
    scrape('https://cnn.com/', false)
}).catch((err) => {
    console.log(`whoops: ${err}`)
});

async function scrape(url, only_this){
    // if(url.includes('http://')) { return; }

    // const exists = await model_result.findOne({_id:url})
    // if(exists){
    //     return console.log("Already scraped.")
    // }

    var doc = await fetch(url) //get content
    doc = await doc.text() //convert it into html plain text
    doc = new JSDOM(doc) //convert it into a valid HTML DOM
    doc = doc.window.document //extract the document object

    if(only_this === true) {

    } else {
        scrape_next_links(doc, url) //continue the loop of scraping
    }

    const descriptionMeta = doc.querySelector('meta[name="description"]');
    const descriptionContent = descriptionMeta ? descriptionMeta.getAttribute('content') : null;

    const imageMeta = doc.querySelector('meta[property="og:image"]');
    const imageContent = imageMeta ? imageMeta.getAttribute('content') : null;

    // console.log({
    //     url:url,
    //     domain:getDomain(url),
    //     title:doc.title,
    //     description:descriptionContent,
    //     updated_at:new Date(),
    // })

    await model_result.findOneAndUpdate(
        {
            _id:url
        },
        {
            domain:getDomain(url),
            title:doc.title,
            description:descriptionContent,
            image:imageContent,
            updated_at:new Date(),
        },
        {
            upsert:true
        }
    ).then(h => {
        console.log(`SUCCESSFULLY SCRAPED - ${url}`)
    })
}

async function scrape_next_links(doc, url){
    const next_links = []
    doc.querySelectorAll('a').forEach(async anchor => {
        if(anchor.href.includes('http://') || anchor.href.startsWith("#") || anchor.href === "" || anchor.href === " " || anchor.href.startsWith('?')){
            return;
        }

        if(anchor.href.startsWith('/')){
            anchor.href = `${getRootUrl(url)}${anchor.href}`
        }

        if(blacklisted_domains.domains.includes(getDomain(anchor.href))){
            return;
        }

        next_links.push(anchor.href)
        scrape(anchor.href, false)
    });
}

function getRootUrl(urlString) {
    const url = new URL(urlString);
    return url.origin;  // This will return the protocol + hostname + port (if present)  
}

function getDomain(urlString) {
    const url = new URL(urlString);
    return url.hostname;  // This will return the protocol + hostname + port (if present)
}

function isValidUrl(urlString) {
    try {
        new URL(urlString);  // If the URL is invalid, this will throw an error
        return true;
    } catch (err) {
        return false;
    }
}

process.on('uncaughtException', function (err) {
    console.log(`Uncaught exception`, `${err.toString()}.`)
});

