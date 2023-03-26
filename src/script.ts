// Because this is a literal single page application
// we detect a callback from Spotify by checking for the hash fragment
import { redirectToAuthCodeFlow, getAccessToken } from "./authCodeWithPkce";

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    //   apiKey: process.env.OPENAI_API_KEY, TODO: fix this
    apiKey: "[OPENAI API KEY]"
});
const openai = new OpenAIApi(configuration);

const clientId = "[SPOTIFY CLIENT ID]";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    const topTracks = await fetchTracks(accessToken);
    const topArtists = await fetchArtists(accessToken);
    const recentTracks = await fetchRecentTracks(accessToken);
    // TODO: put everything in a single dictionary
    populateUI(profile, topTracks, topArtists, recentTracks);
}

async function fetchProfile(code: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    return await result.json();
}

async function fetchTracks(code: string) {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    return await result.json();
}

async function fetchArtists(code: string) {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    return await result.json();
}
async function fetchRecentTracks(code: string) {
    const result = await fetch("https://api.spotify.com/v1/me/player/recently-played", {
        method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    return await result.json();
}




async function populateUI(profile: UserProfile, topTracks: Object, topArtists: Object, recentTracks: Object) {
    // change the arguments to one single dictionary
    var trackList = "";
    var artistList = "";
    var genreList = "";
    var recentTrackList = "";
    for (var i = 0; i < Object.keys(topTracks.items).length; i++) {
        trackList += topTracks.items[i].name + ", ";
        artistList += topArtists.items[i].name + ", ";
        for (var j = 0; j < Object.keys(topArtists.items[i].genres).length; j++) {
            genreList += topArtists.items[i].genres[j] + ", ";
            recentTrackList += recentTracks.items[i].track.name + ", ";
        }
    }


    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: generatePrompt(profile, trackList, artistList, genreList, recentTrackList),
        temperature: 1,
        max_tokens: 1024
    });
    document.getElementById("resp")!.innerHTML = completion.data.choices[0].text.trim();
    console.log(completion);
}

function generatePrompt(profile: UserProfile, trackList: string, artistList: string, genreList: string, recentTrackList: string) {
    var res = profile.display_name + "likes these top songs: " + trackList + "\n these artists: " + artistList +
        "\n these genres: " + genreList + "and these recent tracks: " + recentTrackList +
        "\n list 5 other recommendation tracks along with their own artist and an explanation why he might like these songs. focus more on western genres.";
    res += "\n definitely exclude the tracks I provided as 'recent tracks' as well as the 'top songs' and only recommend things he 'might' be interested in.\
             give the answer in HTML form with a modern-looking table \
            with one row for each track name, artist, and explanation. The table should haave dynamic background color and enough space that takes the whole page vertically.\
            arrange recommendations in descending order of popularity.";
    return res;
}
