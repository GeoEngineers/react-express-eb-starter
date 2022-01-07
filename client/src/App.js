import { useState, useEffect } from 'react';
import './App.css';

const App = () => {
	const [response, setResponse] = useState('');
	const [post, setPost] = useState('');
	const [responseToPost, setResponseToPost] = useState('');

	const callApi = async () => {
		const response = await fetch('/api/hello');
		const body = await response.json();
		if (response.status !== 200) throw Error(body.message);
		return body;
	}

	useEffect(() => {
		let mounted = true;
		callApi()
			.then(response => {
				if (mounted) {
					setResponse(response.express)
				}
			})
			.catch(err => console.error(err));
		return () => mounted = false;
	}, [])

	const handleSubmit = async (e) => {
		e.preventDefault();
		const response = await fetch('/api/world', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({post})
		})
		const body = await response.text();
		setResponseToPost(body);
	}

	return (
		<div className="App">
			<p>{response}</p>
			<form onSubmit={handleSubmit}>
				<p>
					<strong>Post to Server:</strong>
				</p>
				<input
					type="text"
					value={post}
					onChange={e => setPost(e.target.value )}
				/>
				<button type="submit">Submit</button>
			</form>
			<p>{responseToPost}</p>
		</div>
	);
}

export default App;
