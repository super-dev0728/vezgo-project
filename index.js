const commander = require("commander");
const axios = require("axios");
const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/7131a8712268487cafdfa039419bc8bb"
  )
);
const API_KEY = "ckey_fb7e3a0e5abd46ee84c2b6a9b15";
const chain_id = 1; // Ethererum
// const chain_id = 56; // Binance

// var wallet_address = "0x16349A1d5664D7889F57A02Cf1f53188bc4576f7";
var wallet_address;

commander
  .option("--wallet <value>", "Overwriting value.", "Default")
  .parse(process.argv);

const options = commander.opts();
wallet_address = options.wallet;

var wallet_info = {
  balance: "",
  positions: [],
  transactions: [],
};

const getBalance = async (address) => {
  wallet_info.balance = await web3.eth.getBalance(address);
  return;
};

const getPositions = async (address) => {
  var tokens = [];
  const _res = await axios.get(
    `https://api.covalenthq.com/v1/${chain_id}/address/${address}/balances_v2/?key=${API_KEY}`
  );
  _res.data.data.items.forEach((item) =>
    tokens.push({
      symbol: item.contract_ticker_symbol,
      quantity: item.balance / 10 ** item.contract_decimals,
      usd_equivalent: item.quote,
    })
  );
  wallet_info.positions = tokens;
  return;
};

const getTransactions = async (address) => {
  var transactions = [];
  const _res = await axios.get(
    `https://api.covalenthq.com/v1/${chain_id}/address/${address}/transactions_v2/?key=${API_KEY}`
  );
  _res.data.data.items
    .filter((item) => item.value != 0)
    .forEach((item) =>
      transactions.push({
        from_address: item.from_address,
        to_address: item.to_address,
        value: item.value / 10 ** 18,
      })
    );
  wallet_info.transactions = transactions;
  return;
};

const showAll = async () => {
  await getBalance(wallet_address);
  await getPositions(wallet_address);
  await getTransactions(wallet_address);
  console.log(wallet_info);
};

showAll();
