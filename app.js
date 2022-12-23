const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(8080, () => {
      console.log(dbPath);
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getAllMovies = `select movie_name from movie;`;
  const result = await db.all(getAllMovies);
  const movies = result.map((movie) => {
    return {
      movieName: movie.movie_name,
    };
  });
  response.send(movies);
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovie = `
  INSERT INTO
  movie (director_id,movie_name,lead_actor)
  values (
        ${directorId},
       '${movieName}',
      '${leadActor}');`;
  await db.run(addMovie);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = `
  select * from movie where movie_id = ${movieId}`;
  const movieResult = await db.get(movieDetails);
  response.send(convertDbObjectToResponseObject(movieResult));
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetails = `
  UPDATE movie
  set
  director_id = ${directorId},
  movie_name ='${movieName}',
  lead_actor ='${leadActor}'
  where movie_id = ${movieId}`;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = `
  delete from movie where movie_id = ${movieId}`;
  await db.run(movieDetails);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsList = `select * from director`;
  const result = await db.all(getDirectorsList);
  const directorsList = result.map((director) => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    };
  });
  response.send(directorsList);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsList = `select * from movie where director_id = ${directorId}`;
  const result = await db.all(getDirectorsList);
  const movieList = result.map((movie) => {
    const movieObject = {
      movieName: movie.movie_name,
    };
    return movieObject;
  });
  response.send(movieList);
});

module.exports = app;
