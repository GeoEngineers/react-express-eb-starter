
// this is where to make queries to database, perform business logic, etc.

function getData(){
    return [
        {
            "id": "1",
            "name": "John Doe",
            "age": 25,
            "email": "jdoe@test.com"
        },
        {
            "id": "2",
            "name": "Jane Doe",
            "age": 30,
            "email": "jdoe2@test.com"
        },
        {
            "id": "3",
            "name": "John Smith",
            "age": 35,
            "email": "jsmith@test.com"
        }
    ]
}

export {
    getData
};