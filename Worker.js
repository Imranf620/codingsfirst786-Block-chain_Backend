require("dotenv").config();
const { User, UserProfile } = require("./Database");
const { ethers } = require("ethers");
const express = require("express");

const app = express();
app.use(express.json());

const contractAddress = process.env.contractAddress;
// const contractABI = (process.env.contractABI);
// console.log("contractABI:", JSON.parse(process.env.contractABI));
// const contractABI = JSON.parse(process.env.contractABI);
const contractABI = [{"inputs":[{"internalType":"contract IERC20","name":"_usdtAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"matrix","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"level","type":"uint256"}],"name":"LevelActivated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"},{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"}],"name":"Register","type":"event"},{"inputs":[{"internalType":"uint256","name":"program","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"activateLevel","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"checkActiveuplineX1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"checkUplineActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getCurrentX1Level","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getCurrentX2Level","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getIdToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"level","type":"uint256"}],"name":"getRandomUser","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getReferrer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"program","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"getSlotsFilled","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getTotalUSDTReceived","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"program","type":"uint256"},{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"getUserActiveLevel","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"userAddress","type":"address"}],"name":"getUserInfo","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"referrer","type":"address"},{"internalType":"uint256","name":"activeX1Level","type":"uint256"},{"internalType":"uint256","name":"activeX2Level","type":"uint256"},{"internalType":"uint256","name":"referralarReward","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"program","type":"uint256"},{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"getUserPermanetUnlockLevel","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"program","type":"uint256"},{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"getUserSlotLevel","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"program","type":"uint256"},{"internalType":"uint256","name":"level","type":"uint256"}],"name":"isLocked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"isUserExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastUserid","outputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"register","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_systemRecipentAddress","type":"address"}],"name":"updateSystemRecipentAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"_usdtAddress","type":"address"}],"name":"updateToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenAdress","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"}]


const provider = new ethers.JsonRpcProvider(
  "https://bsc-mainnet.infura.io/v3/ceed865512994f26b6e18fce575f85cd"
);
async function readFromContract(walletAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.users(walletAddress);
    return result;
  } catch (error) {
    throw new Error("Error reading from contract: " + error.message);
  }
}
async function readFromContract(walletAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.users(walletAddress);
    return result;
  } catch (error) {
    throw new Error("Error reading from contract: " + error.message);
  }
}
async function getCurrentX1Level(walletAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.getCurrentX1Level(walletAddress);
    return result;
  } catch (error) {
    throw new Error("Error getCurrentX1Level " + error.message);
  }
}
async function getCurrentX2Level(walletAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.getCurrentX2Level(walletAddress);
    return result;
  } catch (error) {
    throw new Error("Error getCurrentX2Level " + error.message);
  }
}
async function GetCurrnetUsers() {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.lastUserid();
    return result;
  } catch (error) {
    throw new Error("Error reading from contract: " + error.message);
  }
}
async function IdtoAdress(val) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.idToAddress(val);
    console.log(result)
    return result;
  } catch (error) {
    throw new Error("Error reading from contract: " + error.message);
  }
}

const gettingALLEntries = async () => {
  const DBUsers = await User.countDocuments();
  console.log("Total Users:", DBUsers);
};
const WorkerFun = async () => {
  try {
    console.log("worker");
    
    const DBUsers = await User.countDocuments();
    const LastBCUsers = Number(await GetCurrnetUsers());

    if (DBUsers == LastBCUsers) {
      return;
    }

    for (let userId = DBUsers + 1; userId <= LastBCUsers - 1; userId++) {
      const USerAdress = await IdtoAdress(userId);
      const ReqData = await readFromContract(USerAdress);
      const PersonalAdress = await IdtoAdress(ReqData[1]);
      
      const newUser = new User({
        Personal: PersonalAdress,
        referrer: ReqData[0],
        id: Number(ReqData[1]),
        currentLevel: Number(ReqData[2]),
        currentX1Level: Number(ReqData[3]),
        currentX2Level: Number(ReqData[4]),
        totalUSDTReceived: Number(ReqData[5]),
      });

      await newUser.save();
      //// Next level logic (Finding the Parent)
      const matches = await User.find({ Personal: ReqData[0] });
      if (matches.length === 0) {
      } else {
        const parentID = matches[0].id;
        const newReferral = Number(ReqData[1]);
        const updateResult = await User.updateOne(
          { id: parentID },
          { $addToSet: { TotalReferred: newReferral } }
        );
        if (updateResult.modifiedCount > 0) {
          const blockchainX1Level = await getCurrentX1Level(PersonalAdress);
          const blockchainX2Level = await getCurrentX2Level(PersonalAdress);

          const dbUser = await User.findOne({ id: (Number) });
          if (!dbUser) {
            return;
          }

          const dbX1Level = dbUser.currentX1Level;
          const dbX2Level = dbUser.currentX2Level;

          if (
            blockchainX1Level !== dbX1Level ||
            blockchainX2Level !== dbX2Level
          ) {
            await User.updateOne(
              { id: newReferral },
              {
                currentX1Level: blockchainX1Level,
                currentX2Level: blockchainX2Level,
              }
            );
          } else {
          }
        } else {
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  readFromContract,
  GetCurrnetUsers,
  gettingALLEntries,
  IdtoAdress,
  WorkerFun,
};
