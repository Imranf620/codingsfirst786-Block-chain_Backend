const { request } = require('express');
const { readFromContract, IdtoAdress } = require('./Worker');
const { UserProfile, User } = require('./Database');

const ProfileCreation = async (req, res) => {
  try {
    const lastUser = await UserProfile.findOne().sort({ id: -1 });

    const newId = lastUser && lastUser.id ? Number(lastUser.id) + 1 : 1;

    const newUserProfile = new UserProfile({
      ...req.body,
      id: newId.toString(),
    });

    await newUserProfile.save();

    res.status(201).json({
      message: 'User profile created successfully!',
      data: newUserProfile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error inserting data', error: error.message });
  }
};

const getUserByWalletAddress = async (req, res) => {
  const { walletAddress } = req.params;

  try {
    const user = await UserProfile.findOne({
      walletAdress: walletAddress,
    }).select('-_id -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const contractData = await readFromContract(walletAddress);

    res.status(200).json({
      message: 'User found successfully',
      data: user,
      contractData: contractData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching user data', error: error.message });
  }
};

const UserRefferalData = async (req, resp) => {
  try {
    const { ID } = req.params;
    if (!ID) {
      return resp.status(400).json({ message: 'User ID is required' });
    }
    const Useradress = await IdtoAdress(ID);
    const partners = await User.countDocuments({
      referrer: Useradress,
    });
    const team = await User.findOne().sort({ id: -1 });
    TeamMembers = team.id - ID;

    const user = await User.findOne({ id: ID });
    if (!user) {
      return resp.status(404).json({ message: 'User not found' });
    }
    let val = user.referrer;
    console.log('value', val);
    const Reffrer = await User.findOne({ referrer: val });
    const UlineAdress = await User.findOne({ Personal: Reffrer.referrer });
    return resp.status(200).json({
      message: 'User found successfully',
      data: [Reffrer],
      Partner: partners,
      Team: TeamMembers,
      UplineAdress: UlineAdress.Personal,
    });
  } catch (error) {
    return resp.status(500).json({
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

const TotalDataApi = async (req, res) => {
  const { ID } = req.params;
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const totalUsers = await User.countDocuments();
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: last24Hours },
    });
    const team = await User.findOne().sort({ id: -1 });
    const TeamMembers = team ? team.id - ID : 0;
    const allUsers = await User.find(
      {},
      { totalUSDTReceived: 1, createdAt: 1 }
    );
    let totalUSDT = 0;
    let last24HoursUSDT = 0;
    for (let i = 0; i < allUsers.length; i++) {
      const user = allUsers[i];
      const amount = parseFloat(user.totalUSDTReceived.toString());
      totalUSDT += amount;
      if (user.createdAt >= last24Hours) {
        last24HoursUSDT += amount;
      }
    }
    return res.status(200).json({
      message: 'User data fetched successfully',
      data: {
        totalUsers,
        recentUsers,
        totalUSDT,
        last24HoursUSDT,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

const fetchReferredUsers = async (req, res) => {
  const { ID } = req.params;
  try {
    // Find the parent user
    const user = await User.findOne({ id: ID }).select('-_id -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referredIds = user.TotalReferred;
    if (!Array.isArray(referredIds) || referredIds.length === 0) {
      return res.status(200).json({
        message: 'User has no referrals',
        data: user,
        referredUsers: [],
      });
    }

    const referredUsers = await User.find({ id: { $in: referredIds } }).select(
      '-_id -__v'
    );

    res.status(200).json({
      message: 'User and referred users found successfully',
      data: user,
      referredUsers: referredUsers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching user data', error: error.message });
  }
};

const getLast24HoursUSDT = async (req, res) => {
  // console.log("in function");

  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const usersLast24Hours = await User.find({
      updatedAt: { $gte: twentyFourHoursAgo },
    });

    const allUsers = await User.find();

    const totalUSDTLast24Hours = usersLast24Hours.reduce((sum, user) => {
      return sum + parseFloat(user.totalUSDTReceived.toString());
    }, 0);

    const totalUSDTAllTime = allUsers.reduce((sum, user) => {
      return sum + parseFloat(user.totalUSDTReceived.toString());
    }, 0);

    res.status(200).json({
      message: 'Total USDT received statistics',
      totalUSDTReceivedLast24Hours: totalUSDTLast24Hours,
      totalUSDTReceivedAllTime: totalUSDTAllTime,
      totalUsers: allUsers.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching data', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    console.log('Api is hitting', id);
    const updatedData = req.body;

    const updatedUserProfile = await UserProfile.findOneAndUpdate(
      { id: id.toString() },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedUserProfile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    res.status(200).json({
      message: 'User profile updated successfully!',
      data: updatedUserProfile,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating data', error: error.message });
  }
};

module.exports = {
  ProfileCreation,
  getUserByWalletAddress,
  getLast24HoursUSDT,
  fetchReferredUsers,
  UserRefferalData,
  TotalDataApi,
  updateUserProfile,
};
