# PlaylistMaker

**PlaylistMaker** is web application built with React that utilizes the Spotify API to allow users to create randomly generated playlists based on the search parameters. The application then creates a link to your spotify account with the generated playlist added to it.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Environment Variables](#environment-variables)
- [License](#license)

## Features

- **User Authentication**: Log in through Spotify's authentication system.
- **Search Functionality**: Search for songs for a playlist with different variables: Genre, year, energy, danceability.
- **Playlist Management**: Add new playlists to your account with randomly selected songs.
- **Track preview**: Listen to short previews of tracks within the app.

## Tech Stack

- **Frontend**: React (Javascript), Tailwind CSS
- **Backend**: Spotify Web API
- **Authentication**: OAuth 2.0 via Spotify's authentication system ([RFC6749](https://datatracker.ietf.org/doc/html/rfc6749))

## Installation

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [Node.js official website](https://nodejs.org/)

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/username/playlistmaker.git
    cd playlistmaker
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the necessary [environment variables](#environment-variables).

    You need your own API key to be able to use this application. You can obtain an API key from Spotify: [Spotify Developer Portal](https://developer.spotify.com/documentation/web-api)

4. Start the development server:

    ```bash
    npm start
    ```

## Usage

1. Open the app in your browser and log in with your Spotify account.
2. Use the search feature to find songs for your playlist.
3. Select songs and add them to a new playlist.

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

    - **VITE_API_CLIENT_ID=**: Your Spotify application's client ID
    - **VITE_API_CLIENT_SECRET=**: Your Spotify application's Client Secret

    Replace these with your own Spotify application credentials, which you can obtain from the [Spotify Developer Portal](https://developer.spotify.com/dashboard/applications).

    - **Note**: Keep your `.env` file safe!

## License

This project is licensed under the (TODO: Sovitaan lisenssistä!) License. See the [LICENSE](LICENSE) file for more details.


Pohjana käytetty https://github.com/spotify/web-api-examples/blob/master/authorization/authorization_code_pkce/public/app.js
joka löytyi sivulta https://developer.spotify.com/documentation/web-api/tutorials/code-flow
