import { useState, useEffect } from "react";

function InlineLoader() {
    const [ loading, setLoading ] = useState(false)
    const [ data, setData ] = useState([])

    useEffect(() => {
        setLoading(true)
        fetch('https://jsonplaceholder.typicode.com/users')
            .then(response => response.json())
            .then(json => {
                setData(json)
                setLoading(false)
            })
    }, [])
    
    // Want a fancier table with all the bells and whistles? 
    // Check out https://github.com/TanStack/table

	return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Inline loader</h2>
                <p className="card-text">
                    This app is fetching data from a placeholder service using a <code>useEffect</code> hook, then displaying it in the table below.
                </p>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td className="text-center" colSpan="2"><span className="spinner-border"/>Loading...</td></tr>}
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

export default InlineLoader;
