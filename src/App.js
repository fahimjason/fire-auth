import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
};

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    photo: '',
    error: '',
    success: false
  });

  const providerGoogle = new firebase.auth.GoogleAuthProvider();
  const providerFacebook = new firebase.auth.FacebookAuthProvider();

  const handleGoogleSignIn = () => {
    firebase.auth().signInWithPopup(providerGoogle)
      .then(res => {
        const { displayName, email, photoURL } = res.user;
        const signedUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }
        setUser(signedUser)
      })
      .catch(err => console.error(err))
  }

  const handleFacebookSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(providerFacebook)
      .then((result) => {
        var credential = result.credential;
        var user = result.user;
        var accessToken = credential.accessToken;
        console.log(user)
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
      });
  }
  const handleSignOut = () => {
    firebase.auth().signOut().then(() => {
      const signedOutUser = {
        isSignedIn: false,
        name: '',
        email: '',
        photo: ''
      }
      setUser(signedOutUser);
    }).catch((error) => {
      // An error happened.
    });
  }


  const handelChange = (e) => {
    let isFieldValid = true;
    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);

    }
    if (e.target.name === 'password') {
      const isValidPassword = e.target.value.length > 6;
      const passwordNumberCheck = /\d{1}/.test(e.target.value);
      isFieldValid = isValidPassword && passwordNumberCheck;
    }
    if (isFieldValid) {
      const userInfo = { ...user };
      userInfo[e.target.name] = e.target.value;
      setUser(userInfo);
    }
  }

  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then(userCredential => {
          // Signed up
          const userInfo = { ...user };
          userInfo.error = '';
          userInfo.success = true;
          setUser(userInfo);
          updateUserInfo(user.name)
          // ...
        })
        .catch(error => {
          const userInfo = { ...user }
          userInfo.error = error.message;
          userInfo.success = false;
          setUser(userInfo)
        });
    }

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((userCredential) => {
          // Signed in
          const userInfo = { ...user };
          userInfo.error = '';
          userInfo.success = true;
          setUser(userInfo);
          console.log(userCredential.user)
          // ...
        })
        .catch((error) => {
          const userInfo = { ...user }
          userInfo.error = error.message;
          userInfo.success = false;
          setUser(userInfo)
        });

    }

    const updateUserInfo = (name) => {
      const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name
      })
        .then(res => {
          // Update successful.
          console.log('Successfully updated');
        })
        .catch(error => {
          // An error happened.
          console.log(error);
        });
    }

    e.preventDefault();
  }
  return (
    <div className="App">
      {
        user.isSignedIn
          ? <button onClick={handleSignOut}>Sign Out</button> : <div><button onClick={handleGoogleSignIn}>Google Sign In</button> <br /> <button onClick={handleFacebookSignIn}>Facebook Sign In</button></div>
      }
      {
        user.isSignedIn && <div>
          <p>Welcome! {user.name}</p>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt="" />
        </div>
      }

      <h1>Our own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="name" onBlur={handelChange} placeholder="Your Name" name="name" required />}
        <br />
        <input type="email" onBlur={handelChange} placeholder="Your Email" name="email" required />
        <br />
        <input type="password" onBlur={handelChange} placeholder="Your Password" name="password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'Logged in'} Successfully</p>}
    </div>
  );
}

export default App;
