import { useEffect, useState } from 'react';
import HeaderBar from './components/HeaderBar';
import SearchResults from './components/SearchResults';
import SearchForm from './components/SearchForm';
import './App.css';
import { getToken, currentToken, getUserData, loginWithSpotifyClick } from './service';

function App() {
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

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
      <HeaderBar isLoggedIn={isLoggedIn} />
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
            {/* Only on first render */}
            {!searchResults ? (
              <SearchForm setSearchResults={setSearchResults} />
            // Subsequent renders
            ) : searchResults.length === 0 ? (
                <div className='form-results'>
                  <SearchForm setSearchResults={setSearchResults} />
                  <SearchResults searchResults={searchResults} />
                </div>
              ) : (
                <div className="form-results flex flex-row items-center content-center justify-center">
                  <SearchForm setSearchResults={setSearchResults} />
                  <SearchResults searchResults={searchResults} />
                </div>
              )
            }
        </div>
      )}
    </div>
  );
}

export default App;
