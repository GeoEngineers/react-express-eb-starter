import ButtonCounter from "../../Components/ButtonCounter";

function Counter() {

	return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">This is a button counter</h2>
                <p className="card-text">
                    This is a simple button counter. State is managed in the button component.
                </p>
                <ButtonCounter/>
            </div>
        </div>
  	);
}

export default Counter;
