#!/usr/bin/env node
const fs = require("fs");


const varSkPath = 'var_sk';

if (!fs.existsSync(varSkPath)) {
    console.log('no var_sk file - creating');
    fs.writeFileSync('var_sk', '');
}





