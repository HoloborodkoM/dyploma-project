import React from 'react';
import UserCard from './UserCard';

interface UserListProps {
  users: { id: number; email: string; name: string; role: string }[];
  onClick: (user: any) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {users.map(user => (
        <UserCard key={user.id} user={user} onClick={() => onClick(user)} />
      ))}
    </div>
  );
};

export default UserList;