import { useState } from "react"
import "./HeaderLink.css"

const TermsOfService = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    // Open or close modal state
    const toggleModal = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <div>
        {/* Clickable link */}
        <p className="header-link" onClick={toggleModal}>
          Terms of Service
        </p>
  
        {/* Modal content */}
        {isOpen && (
          <div className="modal-overlay" onClick={toggleModal}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <p>
                    You are free to use the PlaylistMaker, but any Spotify content 
                    may not be used to train machine learning or AI model.
                </p>
                <p>
                    PlaylistMaker is licensed under the Apache License 2.0. You can read 
                    more about it in our 
                    <a href="https://github.com/Peketeus/PlaylistMaker?tab=Apache-2.0-1-ov-file"> repository</a>
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
  
  export default TermsOfService;