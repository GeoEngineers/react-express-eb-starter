import { useRouteError } from "react-router-dom";

function ErrorBoundary() {
    let error = useRouteError();
    console.log(error);
    return (
        <div className="card m-5 border-danger bg-danger-subtle shadow">
            <div className="card-header">
                <h2 className="card-title">🚨 Something went wrong! 🚨</h2>
            </div>
            <div className="card-body">
                <p><strong>Something went wrong.</strong></p>
                <pre className='alert alert-light text-danger'>
                    {JSON.stringify(error, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default ErrorBoundary;