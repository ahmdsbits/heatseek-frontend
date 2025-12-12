import "./styles.css"

function Card(props) {
  return (
    <div className={`card-box ` + props.className}>
      <h3 className="card-header" style={
        {
          color: props.color
        }
      }>{props.title}</h3>
      <div className="card-content">{props.children}</div>
    </div>
  )
}

export default Card
