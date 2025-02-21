require('dotenv').config();
const { User, UserProfile } = require('./Database');
const { ethers } = require('ethers');
const express = require('express');

const app = express();
app.use(express.json());

const contractAddress = process.env.contractAddress;
// const contractABI = (process.env.contractABI);
const contractABI = JSON.parse(process.env.contractABI);

const provider = new ethers.JsonRpcProvider(
  'https://bsc-mainnet.infura.io/v3/ceed865512994f26b6e18fce575f85cd'
);
async function readFromContract(walletAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.users(walletAddress);
    return result;
  } catch (error) {
    throw new Error('Error reading from contract: ' + error.message);
  }
}
async function readFromContract(walletAddress) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.users(walletAddress);
    return result;
  } catch (error) {
    throw new Error('Error reading from contract: ' + error.message);
  }
}
// async function getCurrentX1Level(walletAddress) {
//   const contract = new ethers.Contract(contractAddress, contractABI, provider);
//   try {
//     const result = await contract.getCurrentX1Level(walletAddress);
//     return result;
//   } catch (error) {
//     throw new Error("Error getCurrentX1Level " + error.message);
//   }
// }
// async function getCurrentX2Level(walletAddress) {
//   const contract = new ethers.Contract(contractAddress, contractABI, provider);
//   try {
//     const result = await contract.getCurrentX2Level(walletAddress);
//     return result;
//   } catch (error) {
//     throw new Error("Error getCurrentX2Level " + error.message);
//   }
// }
async function GetCurrnetUsers() {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.lastUserid();
    return result;
  } catch (error) {
    throw new Error('Error reading from contract: ' + error.message);
  }
}
async function IdtoAdress(val) {
  const contract = new ethers.Contract(contractAddress, contractABI, provider);
  try {
    const result = await contract.idToAddress(val);
    console.log(result);
    return result;
  } catch (error) {
    throw new Error('Error reading from contract: ' + error.message);
  }
}

const gettingALLEntries = async () => {
  const DBUsers = await User.countDocuments();
  console.log('Total Users:', DBUsers);
};
const WorkerFun = async () => {
  try {
    console.log('Worker started...');
    const DBUsers = await User.countDocuments();
    const LastBCUsers = Number(await GetCurrnetUsers());

    if (DBUsers === LastBCUsers) {
      console.log('No new users found.');
      return;
    }

    for (let userId = DBUsers + 1; userId <= LastBCUsers - 1; userId++) {
      console.log(`Processing user ID: ${userId}`);
      const USerAdress = await IdtoAdress(userId);
      const ReqData = await readFromContract(USerAdress);
      const PersonalAdress = await IdtoAdress(ReqData[1]);

      console.log('xxxxxxxxxxxxxxxxxxxxx', USerAdress, ReqData, PersonalAdress);
      const newUser = new User({
        Personal: PersonalAdress,
        referrer: ReqData[0],
        id: Number(ReqData[1].toString()), // Convert BigInt safely
        // currentLevel: Number(ReqData[2].toString()),
        currentX1Level: Number(ReqData[2].toString()),
        currentX2Level: Number(ReqData[3].toString()),
        totalUSDTReceived: Number(ReqData[4].toString()),
      });

      await newUser.save();
      console.log(`User ${userId} saved successfully.`);

      // Finding the Parent
      const matches = await User.find({ Personal: ReqData[0] });
      if (matches.length > 0) {
        const parentID = matches[0].id;
        const newReferral = Number(ReqData[1].toString()); // Ensure conversion

        const updateResult = await User.updateOne(
          { id: parentID },
          { $addToSet: { TotalReferred: newReferral } }
        );

        if (updateResult.modifiedCount > 0) {
          console.log(
            `Updated parent ${parentID} with new referral ${newReferral}`
          );

          // const blockchainX1Level = await getCurrentX1Level(PersonalAdress);
          // const blockchainX2Level = await getCurrentX2Level(PersonalAdress);

          const dbUser = await User.findOne({ id: newReferral });
          if (!dbUser) {
            console.log(`User ${newReferral} not found in DB.`);
            return;
          }

          const dbX1Level = dbUser.currentX1Level;
          const dbX2Level = dbUser.currentX2Level;

          // if (blockchainX1Level !== dbX1Level || blockchainX2Level !== dbX2Level) {
          //   await User.updateOne(
          //     { id: newReferral },
          //     {
          //       currentX1Level: Number(blockchainX1Level.toString()), // Fix BigInt issue
          //       currentX2Level: Number(blockchainX2Level.toString()),
          //     }
          //   );
          //   console.log(`Updated user ${newReferral}'s levels`);
          // }
        }
      }
    }
  } catch (error) {
    console.error('Error processing worker:', error);
  }
};

module.exports = {
  readFromContract,
  GetCurrnetUsers,
  gettingALLEntries,
  IdtoAdress,
  WorkerFun,
};
