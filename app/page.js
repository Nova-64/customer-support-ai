'use client'


import { Box, Button, Stack, TextField } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    assistant: {
      main: '#007bff',
    },
    user: {
      main: '#dc3545',
    },
  },
});
export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the support assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);


  const sendMessage = async () => {
    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ])
 
    // Send the message to the server
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text
 
      let result = ''
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
          ]
        })
        return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
    })
  }


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  useEffect(() => {
    scrollToBottom()
  }, [messages])


  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Button
        variant="contained"
        onClick={() => setIsOpen(true)}
        sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1 }}
      >
        AI Support
      </Button>
      {isOpen && (
        <Stack
          direction={'column'}
          width={{ xs: '90%', sm: '80%', md: '70%', lg: '60%' }}
          height={{ xs: '80vh', sm: '70vh', md: '60vh', lg: '50vh' }}
          border="1px solid black"
          p={2}
          spacing={3}
          sx={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: 'white',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            <Box
              bgcolor="black"
              padding={3}
              flexGrow={1}
            >
             {messages.map((message, index) => (
  <Box
    key={index}
    display="flex"
    justifyContent={
      message.role === 'assistant' ? 'flex-start' : 'flex-end'
    }
  >
    <Box
      bgcolor={
        message.role === 'assistant'
          ? 'Black'
          : 'Black'
      }
      color={
        message.role === 'assistant'
          ? 'white'
          : 'green'
      }
      borderRadius={16}
      padding={2}
      ref={index === messages.length - 1 ? messagesEndRef : null} // Add this line
    >
      {message.content}
    </Box>
  </Box>
      ))}
    </Box>
  </Stack>
  <Stack direction={'row'} spacing={2}>
    <TextField
      label="Message"
      fullWidth
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          sendMessage();
          e.preventDefault();
        }
      }}
    />
    <Button variant="contained" onClick={sendMessage}>
      Send
    </Button>
  </Stack>
  <Button
    variant="contained"
    onClick={() => setIsOpen(false)}
    sx={{ position: 'absolute', top: 10, right: 10 }}
  >
    Close
  </Button>
</Stack>
      )}
    </Box>
  );
}
