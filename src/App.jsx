import { Box, Button, Container, VStack, Input, HStack } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import Messages from './components/Messages';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { app } from './firebase';
import { getFirestore, addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';

const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
};

const logOutHandler = () => signOut(auth);

function App() {

  const [user, setUser] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  // for scroll
  const divForScroll = useRef(null)

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setMessage('');
      await addDoc(collection(db, 'Messages'), {
        text: message,
        uid: user.uid,
        uri: user.photoURL,
        createdAt: serverTimestamp(),

      });
      divForScroll.current.scrollIntoView({behaviour:"smooth"})
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    const q = query(collection(db,"Messages"),orderBy('createdAt','asc'))
    const unsubscribe = onAuthStateChanged(auth, (data) => {
      setUser(data);
    });

    const messagesCollection = q
    const unsubscribeSnapshot = onSnapshot(messagesCollection, (snap) => {
      setMessages(
        snap.docs.map((item) => {
          const id = item.id;
          return { id, ...item.data() };
        })
      );
    });

    return () => {
      unsubscribe();
      unsubscribeSnapshot();
    };
  }, []);

  return (
    <Box bg={'red.50'}>
      {user ? (
        <Container h={'100vh'} bg={'white'}>
          <VStack h={'100vh'} p={4}>
            <Button w={'100%'} colorScheme={'red'} onClick={logOutHandler}>
              Logout
            </Button>
            <VStack h={'full'} w={'full'} overflowY={'auto'} css={{
              '&::-webkit-scrollbar': {
              display:'none'
            }}}>
              {messages.map((item) => (
                <Messages
                  key={item.id}
                  user={item.uid === user.uid ? 'me' : 'other'}
                  text={item.text}
                  uri={item.uri}
                />
              ))}
              <div ref={divForScroll}></div>
            </VStack>
            <form onSubmit={submitHandler} style={{ width: '100%' }}>
              <HStack>
                <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Enter a message...' />
                <Button type='submit' colorScheme='green'>
                  Send
                </Button>
              </HStack>
            </form>
          </VStack>
        </Container>
      ) : (
        <VStack>
          <Button onClick={loginHandler}>SignIn with Google</Button>
        </VStack>
      )}
    </Box>
  );
}

export default App;
