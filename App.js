import { Pressable, Button, FlatList, StyleSheet, Text, SafeAreaView, View, Image} from "react-native";
import { useState, useEffect } from "react";
import { ResponseType, useAuthRequest } from "expo-auth-session";
import { myTopTracks, albumTracks } from "./utils/apiOptions";
import { REDIRECT_URI, SCOPES, CLIENT_ID, ALBUM_ID } from "./utils/constants";
import Colors from "./Themes/colors"
import colors from "./Themes/colors";
import { borderStartColor } from "react-native/Libraries/Components/View/ReactNativeStyleAttributes";

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

const Song = ({artistName, albumImage, songName, albumName, duration}) => {
  return(
    <View style={styles.songStyle}>
      <View style={styles.songImageContainer}>
        <Image source={{ uri: albumImage}} style={{width:50, height:50,}}/>
      </View>
      <View style={styles.songNameArtistContainer}>
        <Text style={styles.songText}>{artistName}</Text>
        <Text style={styles.songText}>{songName}</Text>
      </View>
      <View style={styles.songAlbumNameContainer}>
        <Text style={styles.songText}>{albumName}</Text>
      </View>
      <View style={styles.songTiming}>
        <Text style={styles.songText}>{duration}</Text>
      </View>
    </View>
  );
}

const renderItem = ({item}) => (
    <Song
    artistName = {item.album.artists[0].name}
    albumImage={item.album.images[0].url}
    songName = {item.name}
    albumName = {item.album.name}
    duration = {item.duration_ms}
    />

)
const TopTracks = () => {
    return (
      <SafeAreaView style={styles.topTracksContainer}>
        <FlatList
          data={tracks}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
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

  connectButton: 
  {display: 'flex',
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

  songStyle:
  {display: 'flex',
  flexDirection: "row",
  justifyContent: 'center',
  alignItems: 'center',
  },

  songImageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },

  songNameContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },

  songNameArtistContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
  },
});

