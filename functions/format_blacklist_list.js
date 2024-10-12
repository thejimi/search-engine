const list = ["www.cloudflare.com", "cloudflare.com"]
const formatted_list = []

list.forEach(element => {
    formatted_list.push({"domain":element, "type":"service", "added":new Date()})
});

const fs = require('fs');
var name = 'data/temp_formatted_list.json';
fs.writeFileSync(name, JSON.stringify(formatted_list));

console.log(`Written to data/temp_formatted_list.json`)