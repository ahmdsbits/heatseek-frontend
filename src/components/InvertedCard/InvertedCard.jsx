import "./styles.css"

function InvertedCard(props) {
  return (
    <div className={`inverted-card-box ` + props.className}>
      <h3 className="inverted-card-header" style={
        {
          color: props.color
        }
      }>{props.title}</h3>
      <div className="inverted-card-content">{props.children}</div>
    </div>
  )
}

export default InvertedCard
