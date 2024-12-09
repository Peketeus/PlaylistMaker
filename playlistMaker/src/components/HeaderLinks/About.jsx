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
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce auctor sem eget rhoncus finibus. Cras ac pretium orci. Integer tincidunt, diam eu gravida fermentum, ante ipsum tincidunt massa, in consectetur odio nisl et erat. Duis faucibus, elit sit amet elementum euismod, ipsum tellus sollicitudin nibh, at varius nulla ipsum vel.
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