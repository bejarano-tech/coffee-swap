require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
async function main() {

  // make an API call to the ABIs endpoint 
  const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getabi&address=0x118629329731ce1FF01f9401212C53939F8A9EEB&apikey=${process.env.ETHSCAN_API_KEY}`);
  const data = await response.json();

  // print the JSON response 
  let abi = data.result;

  const filePath = path.resolve(__dirname, 'pool.json');

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