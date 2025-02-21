require('dotenv').config();
const { User, UserProfile } = require('./Database');
const { ethers } = require('ethers');
const express = require('express');

const app = express();
app.use(express.json());

const contractAddress = process.env.contractAddress;
const contractABI = [
  {
    inputs: [
      { internalType: 'address', name: '_usdtAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'SafeERC20FailedOperation',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'matrix', type: 'uint8' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'level',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'FundsDistributed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'matrix', type: 'uint8' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'level',
        type: 'uint256',
      },
    ],
    name: 'LevelActivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint8', name: 'matrix', type: 'uint8' },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'level',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'slotsFilled',
        type: 'uint256',
      },
    ],
    name: 'SlotFilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      {
        indexed: true,
        internalType: 'address',
        name: 'referrer',
        type: 'address',
      },
      { indexed: false, internalType: 'uint256', name: 'id', type: 'uint256' },
    ],
    name: 'UserRegistered',
    type: 'event',
  },
  {
    inputs: [],
    name: 'LAST_LEVEL',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'LEVEL_1_PRICE',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'USDTAddress',
    outputs: [{ internalType: 'contract IERC20', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint8', name: 'matrix', type: 'uint8' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
    ],
    name: '_findActiveReferrer',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint8', name: 'matrix', type: 'uint8' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
    ],
    name: 'activateLevel',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint8', name: 'matrix', type: 'uint8' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
    ],
    name: 'getSlotsFilled',
    outputs: [
      { internalType: 'uint256', name: '_solts', type: 'uint256' },
      { internalType: 'uint256', name: '_recicle', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'id1',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'idToAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'uint8', name: 'matrix', type: 'uint8' },
      { internalType: 'uint256', name: 'level', type: 'uint256' },
    ],
    name: 'isLocked',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'isUserExists',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'lastUserid',
    outputs: [{ internalType: 'uint256', name: 'id', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'referrer', type: 'address' }],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'systemRecipentAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_newID1Addres', type: 'address' },
    ],
    name: 'updateID1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_systemRecipentAddress',
        type: 'address',
      },
    ],
    name: 'updateSystemRecipentAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract IERC20', name: '_token', type: 'address' },
    ],
    name: 'updateToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'users',
    outputs: [
      { internalType: 'address', name: 'referrer', type: 'address' },
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'uint256', name: 'currentX1Level', type: 'uint256' },
      { internalType: 'uint256', name: 'currentX2Level', type: 'uint256' },
      { internalType: 'uint256', name: 'totalUSDTReceived', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_reciver', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdrawUSDT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

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
