
function Home() {

	return (
        <div className="card">
            <div className="card-body">
                <h1 className="card-title">{import.meta.env.VITE_APP_TITLE || 'Template app'}</h1>
                <p className="card-text">
                    This app is a starting place for React apps with an Express backend.
                </p>
                <h3>Features</h3>
                <ul>
                    <li>Check in <code>src/client</code> for all code related to the front end.</li>
                    <li>Check in <code>src/server</code> for all code related to the back end.</li>
                    <li>Examples of common web page functions can be found in the menu bar links.</li>
                </ul>
            </div>
        </div>
  	);
}

export default Home;
