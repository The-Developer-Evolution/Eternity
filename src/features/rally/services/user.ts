import prisma from "@/lib/prisma";

export async function getLeaderBoardData() {
  const leaderboard = await prisma.rallyData.findMany({
    orderBy: [
      { point: "desc" },
      { vault: "desc" },
      { enonix: "desc" },
      { minus_point: "asc" }
    ],
    include: {
      user: true
    },
    where: {
      NOT: {
        vault: 0
      }
    }
  })
  
  return leaderboard;
}

export async function minusEonix(userId: string, amount: number) {
  const userData = await prisma.rallyData.findUnique({
    where: {
      user_id: userId
    }
  });

  if (!userData) {
    throw new Error("User data not found");
  }

  if (userData.enonix < amount) {
    throw new Error("Insufficient Eonix balance");
  }

  const updatedEnonix = userData.enonix - amount;

  const updatedData = await prisma.rallyData.update({
    where: {
      user_id: userId
    },
    data: {
      enonix: updatedEnonix
    }
  });

  return updatedData;
}

export async function addEonix(userId: string, amount: number) {
  const userData = await prisma.rallyData.findUnique({
    where: {
      user_id: userId
    }
  });

  if (!userData) {
    throw new Error("User data not found");
  }

  const updatedEnonix = userData.enonix + amount;

  const updatedData = await prisma.rallyData.update({
    where: {
      user_id: userId
    },
    data: {
      enonix: updatedEnonix
    }
  });

  return updatedData;
}


export async function addSmallItem(userId: string, smallItemId: string, amount: number) {
  const userSmallItemInventory = await prisma.userSmallItemInventory.findFirst({
    where: {
      user_id: userId,
      small_item_id: smallItemId
    }
  });

  if (userSmallItemInventory) {
    const updatedAmount = userSmallItemInventory.amount + amount;

    const updatedInventory = await prisma.userSmallItemInventory.update({
      where: {
        id: userSmallItemInventory.id
      },
      data: {
        amount: updatedAmount
      }
    });

    return updatedInventory;
  } else {
    const newInventory = await prisma.userSmallItemInventory.create({
      data: {
        user_id: userId,
        small_item_id: smallItemId,
        amount: amount
      }
    });

    return newInventory;
  }
}

export async function addBigItem(userId: string, bigItemId: string, amount: number) {
  const userBigItemInventory = await prisma.userBigItemInventory.findFirst({
    where: {
      user_id: userId,
      big_item_id: bigItemId
    }
  });

  if (userBigItemInventory) {
    const updatedAmount = userBigItemInventory.amount + amount;

    const updatedInventory = await prisma.userBigItemInventory.update({
      where: {
        id: userBigItemInventory.id
      },
      data: {
        amount: updatedAmount
      }
    });

    return updatedInventory;
  } else {
    const newInventory = await prisma.userBigItemInventory.create({
      data: {
        user_id: userId,
        big_item_id: bigItemId,
        amount: amount
      }
    });

    return newInventory;
  }
}

export async function minusPoint(userId: string, points: number) {
  const userData = await prisma.rallyData.findUnique({
    where: {
      user_id: userId
    }
  });

  if (!userData) {
    throw new Error("User data not found");
  }

  const updatedMinusPoint = userData.minus_point + points;

  const updatedData = await prisma.rallyData.update({
    where: {
      user_id: userId
    },
    data: {
      minus_point: updatedMinusPoint
    }
  });

  return updatedData;
}

export async function neutralizeMinusPoint(userId: string, points: number) {
  const userData = await prisma.rallyData.findUnique({
    where: {
      user_id: userId
    }
  });

  if (!userData) {
    throw new Error("User data not found");
  }

  const updatedMinusPoint = Math.max(0, userData.minus_point - points);

  const updatedData = await prisma.rallyData.update({
    where: {
      user_id: userId
    },
    data: {
      minus_point: updatedMinusPoint
    }
  });

  return updatedData;
}

export async function upgradeAccessCard(userId: string) {
  const userData = await prisma.rallyData.findUnique({
    where: {
      user_id: userId
    }
  });

  if (!userData) {
    throw new Error("User data not found");
  }

  const requirements = await prisma.access_card_upgrade_cost.findUnique({
    where: {
      id: userData.access_card_level
    }, include:{
      bigItem: true,
      smallItem: true
    }
  });

  if (userData.enonix < requirements?.eonix_cost!) {
    throw new Error("Insufficient Eonix balance");
  }
  
  if(userData.access_card_level >= 5){
    throw new Error("Access Card is already at maximum level");
  }

  const userSmallItemInventory = await prisma.userSmallItemInventory.findFirst({
    where: {
      user_id: userId,
      small_item_id: requirements?.smallItem?.id
    }
  });

  const userBigItemInventory = await prisma.userBigItemInventory.findFirst({
    where: {
      user_id: userId,
      big_item_id: requirements?.bigItem?.id
    }
  });

  if(!userSmallItemInventory || userSmallItemInventory.amount < requirements?.small_item_amount_required!){
    throw new Error("Insufficient small item for upgrade");
  }
  if(!userBigItemInventory || userBigItemInventory.amount < requirements?.big_item_amount_required!){
    throw new Error("Insufficient big item for upgrade");
  }

  const updatedEnonix = userData.enonix - requirements?.eonix_cost!;
  
  const updatedData = await prisma.rallyData.update({
    where: {
      user_id: userId
    },
    data: {
      enonix: updatedEnonix
    }
  });

  return updatedData;
}