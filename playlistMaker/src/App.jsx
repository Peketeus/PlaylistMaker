import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SearchResults from './components/SearchResults';
import SearchForm from './components/SearchForm'
import './App.css';
import { getToken, currentToken, getUserData, loginWithSpotifyClick, logoutClick, apiCallClick } from './service';
import SpotifyLogo from './assets/Primary_Logo_White_CMYK.svg';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    console.log('code =', code)

    // If the code is present in the URL, exchange it for a token 
    if (code && !currentToken.access_token) {
      getToken(code).then((token) => {
        currentToken.save(token);

        console.log('Access token = ', currentToken.access_token)

        // Remove the code-parameter from the URL
        const url = new URL(window.location.href)
        url.searchParams.delete('code')
        const updatedUrl = url.search ? url.href : url.href.replace('?', '')
        window.history.replaceState({}, document.title, updatedUrl)

        setIsLoggedIn(true);

        // Get user data after login
        getUserData().then((data) => setUserData(data));
      });
    } 

    // If we already have a token, fetch the user data
    if (currentToken.access_token || localStorage.getItem('access_token')) {
      getUserData().then((data) => {
        setUserData(data);
        setIsLoggedIn(true);
      });
    }
  }, []);

  return (
    <div className="App">
      <h1>PlaylistMaker</h1>

      {!isLoggedIn ? (
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 p-0'>
          <button onClick={loginWithSpotifyClick}>Log in with Spotify</button>
        </div>
      ) : (

        // Display if the user is logged in
        <div>

          <h2>Welcome, {userData?.display_name}</h2>
          <img className='m-[0_auto] max-w-[6%] max-h-[auto] mb-4' src={userData?.images?.[0]?.url} />

          <SearchForm setSearchResults={setSearchResults} />

          <div>
            <SearchResults searchResults={searchResults} />
            <div className='mt-8'>
              <button onClick={logoutClick}>Log Out</button>
            </div>
          </div>
        </div>
      )}
      <div className='spotify-watermark'>
        <p>Powered by</p><img src={SpotifyLogo} alt='Spotify' /> {/* TODO: make mobile/small screen friendly */}
      </div>
    </div>
  );
}

export default App;
