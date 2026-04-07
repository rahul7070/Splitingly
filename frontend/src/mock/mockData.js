// Mock user data
export const currentUser = {
  id: 'user1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=RS'
};

export const friends = [
  { id: 'user2', name: 'Priya Patel', email: 'priya@example.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PP' },
  { id: 'user3', name: 'Amit Kumar', email: 'amit@example.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AK' },
  { id: 'user4', name: 'Sneha Singh', email: 'sneha@example.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SS' },
  { id: 'user5', name: 'Vikram Mehta', email: 'vikram@example.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=VM' },
  { id: 'user6', name: 'Ananya Reddy', email: 'ananya@example.com', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AR' }
];

export const groups = [
  {
    id: 'group1',
    name: 'Goa Trip 2024',
    description: 'Beach vacation expenses',
    members: ['user1', 'user2', 'user3', 'user4'],
    createdBy: 'user1',
    createdAt: '2024-01-15T10:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Goa'
  },
  {
    id: 'group2',
    name: 'Flat 301',
    description: 'Monthly apartment expenses',
    members: ['user1', 'user2', 'user5'],
    createdBy: 'user1',
    createdAt: '2024-01-01T10:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Flat301'
  },
  {
    id: 'group3',
    name: 'Office Lunch',
    description: 'Daily lunch expenses',
    members: ['user1', 'user3', 'user6'],
    createdBy: 'user3',
    createdAt: '2024-02-01T10:00:00Z',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Lunch'
  }
];

export const expenses = [
  {
    id: 'exp1',
    groupId: 'group1',
    description: 'Hotel booking',
    amount: 12000,
    paidBy: 'user1',
    splitType: 'equal',
    splits: [
      { userId: 'user1', amount: 3000 },
      { userId: 'user2', amount: 3000 },
      { userId: 'user3', amount: 3000 },
      { userId: 'user4', amount: 3000 }
    ],
    category: 'Accommodation',
    date: '2024-02-10T10:00:00Z',
    createdAt: '2024-02-10T10:00:00Z'
  },
  {
    id: 'exp2',
    groupId: 'group1',
    description: 'Scuba diving',
    amount: 8000,
    paidBy: 'user2',
    splitType: 'custom',
    splits: [
      { userId: 'user1', amount: 2000 },
      { userId: 'user2', amount: 2000 },
      { userId: 'user3', amount: 2000 },
      { userId: 'user4', amount: 2000 }
    ],
    category: 'Entertainment',
    date: '2024-02-11T14:00:00Z',
    createdAt: '2024-02-11T14:00:00Z'
  },
  {
    id: 'exp3',
    groupId: 'group2',
    description: 'Electricity bill',
    amount: 3600,
    paidBy: 'user5',
    splitType: 'equal',
    splits: [
      { userId: 'user1', amount: 1200 },
      { userId: 'user2', amount: 1200 },
      { userId: 'user5', amount: 1200 }
    ],
    category: 'Utilities',
    date: '2024-02-05T10:00:00Z',
    createdAt: '2024-02-05T10:00:00Z'
  },
  {
    id: 'exp4',
    groupId: 'group2',
    description: 'Groceries',
    amount: 4500,
    paidBy: 'user1',
    splitType: 'percentage',
    splits: [
      { userId: 'user1', amount: 1500, percentage: 33.33 },
      { userId: 'user2', amount: 1500, percentage: 33.33 },
      { userId: 'user5', amount: 1500, percentage: 33.34 }
    ],
    category: 'Food',
    date: '2024-02-08T18:00:00Z',
    createdAt: '2024-02-08T18:00:00Z'
  },
  {
    id: 'exp5',
    groupId: 'group3',
    description: 'Team lunch at Subway',
    amount: 900,
    paidBy: 'user3',
    splitType: 'equal',
    splits: [
      { userId: 'user1', amount: 300 },
      { userId: 'user3', amount: 300 },
      { userId: 'user6', amount: 300 }
    ],
    category: 'Food',
    date: '2024-02-12T13:00:00Z',
    createdAt: '2024-02-12T13:00:00Z'
  }
];

export const settlements = [
  {
    id: 'settle1',
    groupId: 'group1',
    paidBy: 'user3',
    paidTo: 'user1',
    amount: 1000,
    date: '2024-02-12T15:00:00Z',
    createdAt: '2024-02-12T15:00:00Z'
  },
  {
    id: 'settle2',
    groupId: 'group2',
    paidBy: 'user2',
    paidTo: 'user5',
    amount: 1200,
    date: '2024-02-09T12:00:00Z',
    createdAt: '2024-02-09T12:00:00Z'
  }
];

// Calculate balances
export const calculateBalances = () => {
  const balances = {};
  
  // Initialize balances
  balances[currentUser.id] = {};
  friends.forEach(friend => {
    balances[currentUser.id][friend.id] = 0;
  });

  // Process expenses
  expenses.forEach(expense => {
    const userSplit = expense.splits.find(s => s.userId === currentUser.id);
    if (userSplit) {
      if (expense.paidBy === currentUser.id) {
        // Current user paid
        expense.splits.forEach(split => {
          if (split.userId !== currentUser.id) {
            balances[currentUser.id][split.userId] = 
              (balances[currentUser.id][split.userId] || 0) + split.amount;
          }
        });
      } else {
        // Someone else paid
        balances[currentUser.id][expense.paidBy] = 
          (balances[currentUser.id][expense.paidBy] || 0) - userSplit.amount;
      }
    }
  });

  // Process settlements
  settlements.forEach(settlement => {
    if (settlement.paidBy === currentUser.id) {
      balances[currentUser.id][settlement.paidTo] = 
        (balances[currentUser.id][settlement.paidTo] || 0) - settlement.amount;
    } else if (settlement.paidTo === currentUser.id) {
      balances[currentUser.id][settlement.paidBy] = 
        (balances[currentUser.id][settlement.paidBy] || 0) + settlement.amount;
    }
  });

  return balances[currentUser.id];
};

export const getActivities = () => {
  const activities = [];
  
  expenses.forEach(exp => {
    activities.push({
      id: exp.id,
      type: 'expense',
      ...exp
    });
  });
  
  settlements.forEach(settle => {
    activities.push({
      id: settle.id,
      type: 'settlement',
      ...settle
    });
  });
  
  return activities.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
};