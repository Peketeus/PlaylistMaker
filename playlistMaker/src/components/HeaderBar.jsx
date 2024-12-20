import SpotifyLogo from '../assets/Primary_Logo_White_CMYK.svg';
import PrivacyPolicy from './HeaderLinks/PrivacyPolicy';
import About from './HeaderLinks/About';
import TermsOfService from './HeaderLinks/TermsOfService';
import { logoutClick } from '../service';

function HeaderBar({ isLoggedIn }) {
  return (
    <div className="headerbar flex w-full h-[auto] min-h-[50px] mb-8 relative bg-[#383b3b]">
      <div className='spotify-watermark'>
        <p>Powered by</p><img src={SpotifyLogo} alt='Spotify' />
      </div>

      <ul className='w-[85%] flex justify-end items-center gap-16 mr-8'>
        <li><About /></li>
        <li><PrivacyPolicy /></li>
        <li><TermsOfService /></li>
      </ul>

      {/* Render log out button only if user is logged in */}
      {isLoggedIn ? (
        <div className='logout absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]'>
          <button onClick={logoutClick}>Log Out</button>
        </div>
      ) : (null)}

    </div>
  );
}

export default HeaderBar;