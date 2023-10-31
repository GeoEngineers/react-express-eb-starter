import { useState } from "react";

function SimpleForm() {
    const [ name, setName ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ resp, setResp ] = useState();
    
    function handleSubmit(e){
        e.preventDefault();
        fetch('/api/form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name, email})
            })
            .then(res => res.text())
            .then(text => {
                console.log('response text', text)
                setResp(text)
            })

    }
    
    
    // Want fancier form control?
    // check out https://react-hook-form.com/

	return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Simple Form</h2>
                <p className="card-text">
                    This form collects data from the user and submits it to the <code>/api/form</code> endpoint. The server then sends a response, which is displayed below.
                </p>
                <form className="form-control" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-control" id="name" placeholder="Enter name" />
                    </div>
                    <div className="form-group mt-2">
                        <label htmlFor="name">Email</label>
                        <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="form-control" id="email" placeholder="Enter email" />
                    </div>
                    <div className="mt-3 mb-2">
                        <button type="submit" className="btn btn-primary me-2">Submit</button>
                        <button type="reset" className="btn btn-secondary">Reset</button>  
                    </div>
                </form>
                {resp && <div className="alert alert-success mt-3">{resp}</div>}
            </div>
        </div>
  	);
}

export default SimpleForm;
