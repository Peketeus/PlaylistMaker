import "./Tooltip.css"

const Tooltip = ({ text, tooltipText }) => {
    return (
        <div className="tooltip">
            {text}
            <span className="tooltiptext">{tooltipText}</span>
        </div>
    )
}

export default Tooltip;