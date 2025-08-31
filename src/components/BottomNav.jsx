import { NavLink } from 'react-router-dom';
import { HomeIcon, MapIcon, TrophyIcon, UsersIcon } from './Icons';

export default function BottomNav() {
  const getButtonClass = ({ isActive }) => {
    const baseClass = "flex flex-col items-center justify-center w-full hover:text-blue-800 transition-colors pt-2 pb-1";
    const activeClass = "text-blue-800";
    const inactiveClass = "text-gray-500";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="sticky bottom-0 w-full h-16 bg-white/95 backdrop-blur-sm shadow-t border-t z-30 flex">
      <NavLink to="/" className={getButtonClass} end>
        <HomeIcon />
        <span className="text-xs mt-1">動態</span>
      </NavLink>
      <NavLink to="/map" className={getButtonClass}>
        <MapIcon />
        <span className="text-xs mt-1">地圖</span>
      </NavLink>
      <NavLink to="/challenges" className={getButtonClass}>
        <TrophyIcon />
        <span className="text-xs mt-1">挑戰</span>
      </NavLink>
      <NavLink to="/friends" className={getButtonClass}>
        <UsersIcon className="w-6 h-6" />
        <span className="text-xs mt-1">好友</span>
      </NavLink>
    </nav>
  );
}

