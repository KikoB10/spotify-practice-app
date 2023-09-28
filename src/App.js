import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  InputGroup,
  FormControl,
  Button,
  Row,
  Card,
} from "react-bootstrap";
import React, { useState, useEffect } from "react";

const CLIENT_ID = "38a75038f51346caad43597e8bf99d3c";
const CLIENT_SECRET = "75dc9e35d87d45839d10b006f40be22e";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);

  //API access token. How to run the initializing of the Spotify API. We use this useEffect.
  //the empty array at the end has the funciton run only once. it is the dependecency array. we dont want it to reconnect to the api every time the code gets refreshed.
  //in order to get this access token, we must make a specific request to the Spotify APi to get a token for a specific client to use.
  //takes the website, and some parameters.
  //Spotify is very specific about what it needs to make the access token request. Save those into the authParameters (the specific rules it needs - make sure its a post request, the headers are this, and body has this infp) and then use that in the fetch request.
  //remember that the fetch request gives us a promise and the .then waits for the promise to be fulfilled so we can do soething with the results.
  useEffect(() => {
    const authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    };

    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  //now that accesstoken is set up, we can setup the search function.
  //search is an async function because inside of the functionw e are goign to have a lot of different fetch statements. each fetch kind of needs to wait its turn. if we even need to use 'await' then we need it to be async function.
  //look at Spotify documentation under Search.

  async function search() {
    console.log(`Search for ${searchInput}`);

    //Get request using search to get Artist ID

    const searchParameters = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    const artistID = await fetch(
      `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
      searchParameters
    )
      .then((response) => response.json())
      .then((data) => {
        //Spotify stores the artist id, and they are smart with the the most likely match being at the top
        //the return statement gives artidID a value and "saves" it.
        return data.artists.items[0].id;
      });
    console.log(`Artis ID is ${artistID}`);

    //Get request with Artist ID grab all the albums from the artist
    const albums = await fetch(
      `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
      searchParameters
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setAlbums(data.items);
      });
    //Display those albums to the user
  }
  console.log(albums);

  return (
    <div className="App">
      <Container>
        <InputGroup className="mb-3" size="lg">
          <FormControl
            placeholder="search for artist"
            type="input"
            onKeyPress={(event) => {
              if (event.key == "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button
            onClick={(event) => {
              search();
            }}
          >
            Search
          </Button>
        </InputGroup>
      </Container>
      <Container>
        <Row className="mx-2 row row-cols-4">
          {albums.map((album, i) => {
            console.log(album);
            return (
              <Card>
                <Card.Img src={album.images[0].url} />
                <Card.Body>
                  <Card.Title>{album.name}</Card.Title>
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>
    </div>
  );
}

export default App;
