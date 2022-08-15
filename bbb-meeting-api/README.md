# Akka Http: Hello World Example

This is an Akka HTTP hello-world example compatible with Heroku.

## Usage

To run locally (at `0.0.0.0:8080/v1/hello`):
1. Compile the app: `sbt compile stage`
2. Run: `./target/universal/stage/bin`

To run using locally using heroku (same local address):
1. Compile the app: `sbt compile stage`
2. Run: `heroku local web`

## Tests

Run the tests: `sbt test`

## Live example

See a live example [here](https://bbb-meeting-api.herokuapp.com/v1/hello).

## Authors

* [Rodrigo Hernández Mota](https://www.linkedin.com/in/rhdzmota)

## License

For more information see the `LICENSE.md` file. 
