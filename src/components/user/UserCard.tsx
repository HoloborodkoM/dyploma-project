import React from 'react';
import md5 from 'md5';
import { TranslatedText } from '../TranslatedText';

interface UserCardProps {
  user: { id: number; email: string; name: string; role: string };
  onClick: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  onClick 
}) => {
  return (
    <div className="relative bg-white rounded shadow p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition" onClick={onClick}>
      <img
        src={`https://www.gravatar.com/avatar/${md5(user.email.trim().toLowerCase())}?d=identicon`}
        alt="avatar"
        className="w-16 h-16 rounded-full border mb-2 object-cover"
      />
      <span className="text-sm font-medium break-all">{user.email}</span>
      <span className="text-xs text-gray-500 mb-1"><TranslatedText text={user.name} /></span>
      <span className="absolute top-2 right-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold uppercase">{user.role}</span>
    </div>
  );
};

export default UserCard;