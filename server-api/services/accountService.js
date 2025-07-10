const { User } = require("../models");

async function getUserWithAccounts(userId) {
  const user = await User.findByPk(userId, {
    include: [
      {
        model: User,
        as: "childAccounts",
      },
      {
        model: User,
        as: "parentAccount",
      },
    ],
  });

  if (!user) {
    throw new Error("用户不存在");
  }

  return user;
}

module.exports = {
  getUserWithAccounts,
};
