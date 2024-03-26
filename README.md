# Project Name

This is a template for a Node.js E-commerce project that uses Express.js and MongoDB. It includes a basic project
structure and configuration for environment variables.

## Prerequisites

This project requires Node.js and npm. Make sure you have them installed on your machine. Also you need to have a
MongoDB instance running or using MongoDB Atlas.

## MongoDB Configuration

MongoDB should have a database named `shop` and a collections named `products`, `users`, `orders`.

## Environment Variables

This project uses environment variables for configuration. These are stored in `.env` files located in
the `environments` directory.

### Creating an Environment File

1. Create a new `.env` file in the `environments` directory. The name of this file should reflect the environment it
   represents (e.g., `local.env`, `production.env`).

2. In this file, specify your MongoDB connection string as follows:

```dotenv
MONGODB_URI=your_mongodb_uri
```

### Setting the NODE_ENV Variable

Set the `NODE_ENV` variable in your local environment to match the name of your `.env` file (without the `.env`
extension). For example, if you have a `local.env` file, you would set `NODE_ENV=local`.

You can do this in your terminal before running your application:

```
export NODE_ENV=local
```

### Ignoring Environment Files in Git

The `.env` files contain sensitive data and are specific to each environment. Therefore, they should not be committed to
your version control system. Add `environments/*.env` to your `.gitignore` file to ensure they are not tracked by Git.

## Running project

Run the following command to install the project dependencies:

```
npm install
```

To start the application, run:

```
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
