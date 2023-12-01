export const UserSelect = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  profile: {
    select: {
      username: true,
      profileImage: true,
    },
  },
};
