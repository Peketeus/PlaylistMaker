import React, { useState } from "react"
import "./HeaderLink.css"

const PrivacyPolicy = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    // Open or close modal state
    const toggleModal = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div>
        {/* Clickable link */}
        <p className="header-link" onClick={toggleModal}>
          Privacy Policy
        </p>
  
        {/* Modal content */}
        {isOpen && (
          <div className="modal-overlay" onClick={toggleModal}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <p>
                    At PlaylistMaker, we take your privacy seriously. This Privacy
                    Policy outlines how we handle your information when using our
                    application.
                </p>
                <p>
                    No Data Collection: PlaylistMaker does not collect,
                    store, or share any personal data from its users.
                </p>
                <p>
                    Spotify Integration: PlaylistMaker requires authentication
                    through your Spotify account to function. This authentication is
                    used solely to allow the app to create and modify playlists on
                    your behalf.
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
  
  export default PrivacyPolicy;