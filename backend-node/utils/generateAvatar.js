const generateAvatar = (name) => {
  const seed = name.replace(/\s/g, '');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}`;
};

module.exports = generateAvatar;