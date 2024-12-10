import React, { useState } from "react"
import "./HeaderLink.css"

const About = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Open or close modal state
    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            {/* Clickable link */}
            <p className="header-link" onClick={toggleModal}>
                About
            </p>

            {/* Modal content */}
            {isOpen && (
                <div className="modal-overlay" onClick={toggleModal}>
                    <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                        <p>
                            PlaylistMaker is a web application built with React that uses 
                            the Spotify API to create randomly generated playlists 
                            based on search parameters. You can then add the generated 
                            playlist to your Spotify account.
                        </p>
                        <p>
                            After logging in, you can generate playlists by specifying a genre and 
                            optionally a year range. Due to recent changes in the Spotify API, 
                            the sliders are no longer functional.
                        </p>
                        <p>
                            For more information, you can check out our GitHub <a href="https://github.com/Peketeus/PlaylistMaker">repository</a>
                        </p>
                        <button className="close-button" onClick={toggleModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default About;