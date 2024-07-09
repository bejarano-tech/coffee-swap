require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
async function main() {

  // make an API call to the ABIs endpoint 
  const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getabi&address=0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2&apikey=${process.env.ETHSCAN_API_KEY}`);
  const data = await response.json();

  // print the JSON response 
  let abi = data.result;

  const filePath = path.resolve(__dirname, 'ERC_20.json');

  const jsonData = abi;

  fs.writeFile(filePath, jsonData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON file:', err);
    } else {
      console.log('JSON file written correctly inside', filePath);
    }
  });
}

main();