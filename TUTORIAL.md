# Andy's rough tutorial

This tutorial is designed to help someone who is unfamiliar with React, Express, Node or even JavaScript or HTML. Once the local development server is running, it should help get this someone up to speed on how the pieces work.

**Feel free to skim the parts that might already be familiar to you.** This was originally written for an audience of people who were new to web programming.

## Part 1 - HTTP request and response

Consider this practice for something we will be doing more of later. This is a foundational concept of web development: The browser makes an HTTP request to a server's IP address and the server responds with data. 

<details>
<summary>BTW, about HTTP requests...</summary>
When you visit http://google.com you are actually visiting http://google.com:80. Port 80 is the default port for the HTTP protocol. The default protocol for HTTPS is 443. When you're visiting a website in the browser it will always be <ipaddress>:<port> even if the IP address and port are hidden behind a URL. How URLs are mapped to IP addresses is a whole other topic. Our server is a REST server, which is not really a technology but as much as a spec. The [MDN docs](https://developer.mozilla.org/en-US/docs/Glossary/REST) are a great place to learn more about REST.
</details>

Your task is to make a new server route at `/api/yourname` where "yourname" is, well, your name. URLs are not case sensitive, so it should be all lower case, e.g. `/api/zeigert`. The route should accept a GET request and return a JSON object containing the following:

```
{
    name: '<your name>',
    color: '<your favorite color>'
}
```

I'd like everyone to do this work on a new branch from `main`. Be sure to pull from remote before you start, as I might have made a few updates. Then you can create and check out a new branch using the following command:

```
git checkout -b <yourname>-dev
```

You'll find an example route at `/src/server/restExample1.mjs`. Please create a new JavaScript file for your route. Remember that any new routes you create will have to be added to the Express app in the root server file, located at `/src/server/main.mjs` file. More info on Express routers can be found [in the Express docs](https://expressjs.com/en/4x/api.html#router).

_Note: JavaScript files usually have the .js file extension. However, our server files use the .mjs extension. This tells node that they are modules. That is, they use the modules syntax of `import xxx from 'xxx'` instead of the require syntax of `const xxx = require('xxx')`. Functionally they are the same, and .mjs just tells node how to treat that file._ 

Remember that you can run the dev app if you want using `npm run dev`. This starts the express server and serves hot-reloadable client code using Vite. Since we are just going to be doing server-side development on this tutorial, you can use `npm start`. This will start the Express node app and serve the API at `localhost:3000`.

From a browser, you should be able to reach your route at `localhost:3000/api/<yourname>`. The browser should then display your route's response JSON.

### Bonus challenge:

Add a query parameter to your route. For example, `/api/<yourname>?input=55`. Parse that query parameter in your route handler function, multiply it by 33 and add that number as a property named `output` in your return JSON. 

## Part 2 - Web client using React

Create a client page in the web client

### Background

Last week we created a server endpoint that accepts GET requests and responds with some basic data. This week, we're going to render that data in a React component.

Our server endpoint is fairly simple. The browser asks the server for some data, and it returns that data. Sometimes it runs some code to create that data, such as querying a database or processing some input, but it's generally just returning data to the browser. (Even the HTML and CSS and Javascript that the client will eventually render are ultimately just included in a response to an initial GET request.)

Our client receives the initial HTML file, which includes references to some other files, namely CSS, which tells our HTML file how to render, and a bunch of bundled JavaScript files, which tell the browser what to do next.

We could have made this with vanilla JS using [the DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) and its JS bindings. But that requires writing a lot of boilerplate code and writing rather complicated event handlers. So smart people created frameworks to help make this easier. One of those frameworks is called React, and react takes a "reactive" approach to updating the DOM. That means that it watches the state of a bit of source data, like a javascript object, and if that object changes, it updates the DOM and rerenders the page automatically. It's more complicated than that, but that's the gist of it.

### Virtual routes

It's not important right now to understand exactly how React Router works, but I'll cover the basics briefly:

Remember that React is a javascript program that is running in your web browser that manupulates the DOM. Paths that are defined specifically in `server.js` like `/api/hello` are understood to be requests to the server. However, any path _not_ specifically defined as a route in Express is resolved back to `/`. Therefore, React needs a way to understand paths that refer to different client "pages" that exist only as programmatic references. The React Router module handles those requests and keeps the browser URL in sync. You can see how this is configured in `src/client/App.js`.

### Create a new React route

This is a simple component that I'll be asking you to expand upon. It essentially renders a basic form, allows the user to submit input to the server endpoint we built last week, and then renders the response.

Your task for next week is to create a new component in the `Screens` directory, using your name as the component name. Then, copy the code from the `Simple Form` example. Add a new route in `App.js` that points `/yourname` to your new component.

Then, update the form to include input fields for a user to enter a number and their favorite color. 

You'll need to then update the API handler that we created last week to accept those incoming values as query parameters and return them in the response.

Then, in our React component, you'll need to display those values just as the example currently displays the `output` value.

### Bonus 1

Add [label elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label) to the input fields.

### Bonus 2

Render [a slider](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) input control below the number input field. _Hint: These will both use the same state and state update function._

Happy coding! Be sure to reach out to me if you have any questions or get stuck.

## Part 3 - Populate a database table using a form

Create a form on your dev page that lets a user submit their name, favorite color, a date and an integer. The form should submit all of the entries to the server in a POST request. The server should receive the data and create a new row in the database. 

Add another section to your web client page with a button that, on click, submits a GET request to the server. The server should respond with all rows in the table. Display these rows on your page as a list or table.

### Create a new schema and table

Use `npm run knex migrate:make your_migration_name` to created a migration file in `db/migrations/dev`. Use the other migration files as reference.

Create a new schema in the subcontractor database using migrations. I used my name for the schema name, but you can use whatever you'd like. 

In the same migration file, create a new table with columns for `name`, `color`, `date` and `inputNumber`. These should have the appropriate types based on [the Postgres docs](https://www.postgresql.org/docs/current/datatype.html). See `db/migrations/dev/20221108234411_create_andy_table.js` for an example. _(Note: If you create a new migration and include the migration file from the `hello-world` branch, you'll end up with two new schemas. That's OK.)_

Run the migration file and check your database with `psql` or pgAdmin.

### Update the server

In your existing server route, create a new handler for POST requests. This handler should now be used to create new database records. It will now accept all form input in the request body and pass that to the knex insert command. _(See `restExample1.mjs` for an example.)_ 

Update the GET handler on your server router to query your table and return all results. _(Again, see `restExample1.js` for an example.)_ 

### Update the client

Update your React component. Create state constants for each field and create form elements for each field. Update the submit function to issue a POST request. _(See `src/Screens/SimpleForm/index.js` for an example.)_

Finally, we want to allow the user to query the database and view the results.

Create a new HTML `section` below the section that contains the form. This new section should contain either an [unordered list](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ul) or a [table](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table).

Add an [html button](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button) below the list or table. The button should have an onClick handler. Define the onClick handler above the return statement, similar to the `onSubmit` handler for the form. This handler should be a function that makes a GET request to your router endpoint, which should return a list of all the rows in your table. Store this response in a state object, similar to the existing output state objects.

The list or table should rerender whenever the new state object is updated in your fetch call. When your response is an array, you can render list items using the [array map method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), e.g.:

```
<div>
    {stateItem.map((item, i) => {
        return (
            <p key={i}>{item}</p>
        )
    })}
</div>

```

The above code will render a parent div with a child paragraph element for every entry in the stateItem array. (The `key` property is required when creating lists in React.)

### Bonus 1

- For your new form elements, use the appropriate [input type](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) for each input. This will render browser-provided input helpers, such as calendar pickers.

- Store the `inputNumber` in the database, but when fetching in the GET request, return the input number multiplied by 77.

## Part 4 - Using styles in React components

This week's task is mostly going to be focused on the font-end client and styling. Now that we've added more inputs and a table, the rudementary layout of our app is becoming more glaring. Although there is something to be said for the built-in heuristics of generic browser rendering, we can do better by adding some CSS.

### Adding styles directly

Feel free to apply CSS properties directly to elements. CSS styles can be added to any JSX element via object notation in the `style` tag, e.g.:

```javascript
<MyComponent style={{backgroundColor: '#f0f0f0'}}/>
```

Note that CSS passed in object notation can take two forms; using the literal css property name in string form, or a camel-cased property name that doesn't require quotation marks. React will translate the camel-case property name into the correct css property name. The following are equivalent:

```javascript
<MyComponent style={{'background-color': '#f0f0f0'}}/>
<MyComponent style={{backgroundColor: '#f0f0f0'}}/>
```

### Adding styles via classes (or other selectors)

Any JSX component can be assigned a CSS class using the `className` property. React will translate this into the `class` property when rendering the HTML:

```javascript
<MyComponent className="my-class"/>
```

will render out to something like

```html
<div class="my-class"></div>
```

By _something like_ I mean that `MyComponent` might be defined in such a way that it includes any number of other child elements or built in classes, or it could render out different DOM elements entirely.

For convenience, I've added a `helloworld.css` document to the HelloWorld component folder and imported it at the top of the `HelloWorld.js` script. React will then compile any custom CSS in that file into the bundled output. You can see an example in that CSS document that styles `h2` elements with orange text. Place any custom CSS classes in this file.

### Using a CSS framework

This template app was built using the [Bootstrap toolkit](https://getbootstrap.com/docs/5.2/getting-started/introduction/). Consequently, the Bootstrap library is included on every rendered page in the app. Therefore, we can use any of the many component and utility classes available in that framework to style our JSX. 

Using a framework is not necessary, but it can save hours of fiddling with CSS classes. There are many front-end CSS frameworks out there (Material, Tailwind, Fluent) and we settled on Bootstrap simply because we've used it before.

### Add Bootstrap classes

Using a combination of Bootstrap classes and/or custom CSS, please update the layout of the component you developed. (Feel free to copy the starter code from the `hello-world` branch if you want to jump ahead.)

- Add `<label>` [elements to form inputs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
- Add styles via Bootstrap classes to the following:
    - Table
    - Buttons
    - Form inputs
    - Wrap the form and the table in Bootstrap `card` elements
    - Center both the form and the table section on the page, using layout classes. 

### Bonus

- Add a separate input for last name, including a corresponding new table column in the database. Write a new migration to add the new column to the table and, optionally, [rename](https://knexjs.org/guide/schema-builder.html#renamecolumn) the existing `name` column to something like `firstName`. For an example of adding a new column to an existing table, see `db/migrations/dev/20221012213320_add_azure_id_to_review_table.js`.

- Add another input element for color that allows the user to type the hex value directly. Both should be connected to the `color` state.