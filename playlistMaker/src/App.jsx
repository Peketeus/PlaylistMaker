import React, { useEffect, useState } from 'react';
import './App.css';
import { getToken, currentToken, getUserData, loginWithSpotifyClick } from './service';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    console.log('code =', code)

    // If the code is present in the URL, exchange it for a token
    if (code) {
      getToken(code).then((token) => {
        currentToken.save(token);

        // Poistetaan URL:sta code parametri
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
      return;
    }

    if (!currentToken.access_token) {
      console.log('You dont have the access token!')
    }

    if (!code) {
      setIsLoggedIn(false)
      localStorage.clear()
      console.log('Local storage tyhjennetty, koska !code')
    }
  }, []);

  return (
    <div className="App">
      <h1>PlaylistMaker</h1>

      {!isLoggedIn ? (
        <button onClick={loginWithSpotifyClick}>Login with Spotify</button>
      ) : (
        <div>
          <h2>Welcome, {userData?.display_name}</h2>
          <img src={userData?.images?.[0]?.url} alt="Profile" />
        </div>
      )}
    </div>
  );
}

export default App;
