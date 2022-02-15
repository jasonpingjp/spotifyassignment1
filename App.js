import { Pressable, Button, FlatList, StyleSheet, Text, SafeAreaView, View, Image} from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import colors from "./Themes/colors";
import { borderStartColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";
import millisToMinutesAndSeconds from "./utils/millisToMinuteSeconds.js"

// Endpoints for authorizing with Spotify
const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token"
};

let contentDisplayed = null;

export default function App() {

  const [token, setToken] = useState("");
  const [tracks, setTracks] = useState([]);
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: ResponseType.Token,
      clientId: CLIENT_ID,
      scopes: SCOPES,
      // In order to follow the "Authorization Code Flow" to fetch token after authorizationEndpoint
      // this must be set to false
      usePKCE: false,
      redirectUri: REDIRECT_URI
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      setToken(access_token);
    }
  }, [response]);

  useEffect(() => {
    const fetchTracks = async () => {
      // TODO: Comment out which one you don't want to use
      // myTopTracks or albumTracks

      const res = await myTopTracks(token);
      // const res = await albumTracks(ALBUM_ID, token);
      setTracks(res);
    };

    if (token) {
      // Authenticated, make API request
      fetchTracks();
    }
  }, [token]);

const Song = ({songIndex, artistName, albumImage, songName, albumName, duration}) => {
  return(
    <View style={styles.songStyleContainer}>
      <Text style={styles.songIndexContainer}>{songIndex}</Text>
      <Image source={{ uri: albumImage}} style={{width:50, height:50}}/>
      <View style={styles.songTitleAndArtistContainer}>
        <Text style={styles.songTitleFont} numberOfLines={1}>{songName}</Text>
        <Text style={styles.songArtistFont} numberOfLines={1}>{artistName}</Text>
      </View>
      <Text style={styles.songAlbumFont} numberOfLines={1}>{albumName}</Text>
      <Text style={styles.songTimeFont} numberOfLines={1}>{millisToMinutesAndSeconds(duration)}</Text>
    </View>
  );
}

const renderItem = ({item, index}) => (
    <Song
    songIndex = {index}
    artistName = {item.album.artists[0].name}
    albumImage={item.album.images[0].url}
    songName = {item.name}
    albumName = {item.album.name}
    duration = {item.duration_ms}
    />

)
const TopTracks = () => {
    return (
      <View style={styles.topTracksContainer}>
        <View style={styles.topTracksTopTitle}>
          <Image style={styles.logoTitleTopTracks} source={require("./assets/spotify-logo.png")}/>
          <Text style={styles.myTopTracksText}>My Top Tracks</Text>
        </View>
        <View style={styles.topSongsContainer}>
          <FlatList
            data={tracks}
            renderItem={renderItem}
            keyExtractor={item => item.id}
          />
        </View>
       </View> 
    );
  }


const ConnectWithSpotify = () => {
    return (
      <Pressable 
      onPress={() => {
        promptAsync();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? colors.gray
            : colors.spotify,
            borderRadius: '100%',
            height: 40,
            width: 250,
        },
        styles.wrapperCustom
      ]}>
      {({ pressed }) => (
        <View style = {styles.connectButton}>
            <Image style= {{width:15,height: 15, marginTop:10}} source={require("./assets/spotify-logo.png")}/>
            <Text style={styles.connectWithSpotifyText}>
            {pressed ? 'CONNECT WITH SPOTIFY' : 'CONNECT WITH SPOTIFY'}
              </Text>
        </View>

      )}
      </Pressable>
    );
  }

console.log(tracks)
if (token) {
    // Authenticated, make API request
    contentDisplayed = <TopTracks/>
  }else{
    contentDisplayed = <ConnectWithSpotify/>
}
  
return (
    <SafeAreaView style={styles.container}>
      {contentDisplayed}
    </SafeAreaView>
  );
} 

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },

  connectWithSpotifyText: {
    paddingLeft: 7,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 12
  },

  connectButton: {
    display: 'flex',
    flexDirection: "row",
    justifyContent: 'center',
    alignItems:'center'
  },
  
  songText: {
    color: 'white',
    fontWeight: 'bold',
  },

  topTracksContainer: {
    display: 'flex',
    backgroundColor: Colors.background,
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },

  topSongsContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: "center",
    alignItems: "center",
    flex: 10
  },

  topTracksTopTitle: {
    display: 'flex',
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: "center",
    alignItems: "center",
    flex: 1
  },

  logoTitleTopTracks: {
    height: 15,
    width: 15,
  },

  myTopTracksText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 10
  },

  songStyleContainer:{
    display: 'flex',
    flex: 1,
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  songIndexContainer: {
    color: Colors.gray,
    width: 30,
    textAlign: 'center',
    fontSize: 12,
  },

  songTitleAndArtistContainer: {
    display: 'flex',
    flex: 0,
    flexDirection: 'column',
    width: 120,
    marginLeft: 10,
  },

  songTitleFont: {
    color: "white",
    textAlign: 'center',
    fontSize: 12
  },

  songArtistFont: {
    color: "darkgray",
    textAlign: 'center',
    fontSize: 12
  },

  songAlbumFont: {
    color: "white",
    textAlign: 'center',
    fontSize: 12,
    width: 100,
    marginLeft: 10,
  },

  songTimeFont: {
    color: "white",
    textAlign: 'center',
    fontSize: 12,
    width: 30,
    marginLeft: 10,
  },

  songNameArtistContainer: {
    flex: 0,
    display: 'flex',
    justifyContent: 'center',
  },
});

