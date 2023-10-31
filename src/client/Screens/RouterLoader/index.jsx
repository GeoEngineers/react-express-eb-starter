import { useLoaderData } from "react-router-dom";

function RouterLoader() {
    const data = useLoaderData();

    // Want a fancier table with all the bells and whistles? 
    // Check out https://github.com/TanStack/table

	return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Router loader</h2>
                <p className="card-text">
                    This app is fetching data from the server using the React Router loader functionality, then displaying it in the table below.
                </p>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
  	);
}

export default RouterLoader;
