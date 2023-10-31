import { Routes, RouterProvider, Outlet, Link, BrowserRouter, createBrowserRouter } from 'react-router-dom';
import Layout from "./Screens/Layout";
import Counter from "./Screens/Counter";
import Home from "./Screens/Home";
import RouterLoader from "./Screens/RouterLoader";
import InlineLoader from './Screens/InlineLoader';
import SimpleForm from './Screens/SimpleForm';

export const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout/>,
		children: [
			{
				path: "/",
				element: <Home/>
			},
			{
				path: "counter",
				element: <Counter/>
			},
			{
				path: "router-loader",
				element: <RouterLoader/>,
				loader: async () => {
					return fetch(`/api/restExample1`);
				}
			},
			{
				path: "inline-loader",
				element: <InlineLoader/>,
			},
			{
				path: "simple-form",
				element: <SimpleForm/>,
			}
		]
	}
]);

function App() {

	return (
		<RouterProvider router={router} />
  	);
}

export default App;
