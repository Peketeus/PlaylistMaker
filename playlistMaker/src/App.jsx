import React, { useEffect, useState } from 'react';
import './App.css';
import { getToken, currentToken, getUserData, loginWithSpotifyClick, logoutClick, apiCallClick } from './service';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    console.log('code =', code)

    // If the code is present in the URL, exchange it for a token
    if (code && !currentToken.access_token) {
      getToken(code).then((token) => {
        currentToken.save(token);

        console.log('Access token = ', currentToken.access_token)

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
    }
  }, []);

  return (
    <div className="App">
      <h1>PlaylistMaker</h1>

      {!isLoggedIn ? (
        <button onClick={loginWithSpotifyClick}>Login with Spotify</button>
      ) : (
        // Tämä näytetään, jos on kirjauduttu sisään
        <div>
          <h2>Welcome, {userData?.display_name}</h2>
          <img src={userData?.images?.[0]?.url} alt="Profile" />
          <div>
            <button onClick={() => apiCallClick('0cmANMS0v2eDqkCD093mHc')}>API CALL</button>
          </div>
          <div>
            Tähän voi esimerkiksi laittaa löytyneitä biisejä esille
          </div>
          <div>
            <button onClick={logoutClick}>LOG OUT</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
