import React, { useEffect, useState } from 'react';
import './App.css';
import { redirectToSpotifyAuthorize, getToken, currentToken, getUserData, loginWithSpotifyClick } from './service';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');

    // If the code is present in the URL, exchange it for a token
    if (code) {
      getToken(code).then((token) => {
        currentToken.save(token);
        setIsLoggedIn(true);

        // Get user data after login
        getUserData().then((data) => setUserData(data));
      });
    } else if (currentToken.access_token) {
      // If we already have a token, fetch the user data
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
