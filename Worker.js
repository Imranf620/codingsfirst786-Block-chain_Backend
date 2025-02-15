require("dotenv").config();
const { User, UserProfile } = require("./Database");
const { ethers } = require("ethers");
const express = require("express");

const app = express();
app.use(express.json());

const contractAddress = process.env.contractAddress;
const contractABI = (process.env.contractABI);

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
    const result = await contract.lastUserId();
    return result;
  } catch (error) {
    throw new Error("Error reading from contract: " + error.message);
  }
}
async function IdtoAdress(val) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.idToAddress(val);
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

          const dbUser = await User.findOne({ id: newReferral });
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
