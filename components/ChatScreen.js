import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { Avatar, Button, DialogActions, DialogContentText, DialogTitle, IconButton } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon"
import { useCollection } from "react-firebase-hooks/firestore";
import SendIcon from "@material-ui/icons/Send";
import CloseIcon from "@material-ui/icons/Close";
import { createRef, useEffect, useRef, useState } from "react";
import firebase from "firebase";
import Message from "./Message";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import {Picker as EmojiPicker} from 'emoji-mart';
import "emoji-mart/css/emoji-mart.css";

function ChatScreen({ chat, messages }) {
    const [user] = useAuthState(auth);
    const router = useRouter();
    const endOfMessagesRef = useRef(null);
    const [open, setOpen] = React.useState(false);
    const [openDel, setOpenDel] = useState(false);
    
    const inputRef = createRef();
    const [input, setInput] = useState("");
    const [showEmojis, setShowEmojis] = useState();
    const [cursorPositions, setCursorPositions] = useState();
    const [openEmoji, setOpenEmoji] = useState(false);

    const pickEmoji = (emoji) =>{
        const ref = inputRef.current;
        ref.focus();
        const start = input.substring(0,ref.selectionStart);
        const end = input.substring(ref.selectionStart);
        const text = start + emoji.native + end;
        setInput(text);
        setCursorPositions(start.length+emoji.native.length);
        console.log("Length: ",start.length+emoji.native.length);
    };
    const [messagesSnapshot] = useCollection(
        db.collection('chats').
            doc(router.query.id).collection('messages')
            .orderBy("timestamp", "asc")
    );

    const [recipientSnapshot] = useCollection(
        db.collection("users")
            .where("email", "==", getRecipientEmail(chat.users, user))
    );

    //Function to map documents within the collection and delete them individually!!
    const delMessages = () => {
        db.collection('chats').doc(router.query.id).collection('messages')
            .get().then((res) => {
                res.forEach(element => {
                    element.ref.delete();
                })
            });
        handleCloseDel();
    }

    const showMessages = () => {
        if (messagesSnapshot) {
            return messagesSnapshot.docs.map(message => (
                <Message
                    key={message.id}
                    user={message.data().user}
                    message={{
                        ...message.data(),
                        timestamp: message.data().timestamp?.toDate().getTime(),
                    }}
                />
            ));
        }
        else {
            return JSON.parse(messages).map((message) => (
                <Message key={message.id} user={message.user} message={message} />
            ))
        }
    };

    const scrollToBottom = () => {
        endOfMessagesRef.current.scrollIntoView({
            behavior: 'smooth',
            block: "start",
        });
    }

    const sendMessage = (e) => {
        e.preventDefault();

        //Update the lastSeen....
        db.collection("users").doc(user.uid).set(
            {
                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            }, { merge: true }
        );

        db.collection('chats').doc(router.query.id).collection('messages').add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: input,
            user: user.email,
            photoURL: user.photoURL,
        });

        setInput("");
        scrollToBottom();
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClickOpenDel = () => {
        setOpenDel(true);
    };

    const handleCloseDel = () => {
        setOpenDel(false);
    };

    const handleChange = (e) => {
        setInput(e.target.value);
    };

    const handleShowEmojis = () =>{
        inputRef.current.focus();
        setShowEmojis(!showEmojis);
        setOpenEmoji(true);
    }
    
    const handleCloseEmoji = () =>{
        setOpenEmoji(false);
    }

    useEffect(()=>{
        inputRef.current.selectionStart = cursorPositions;
    },[cursorPositions]);

    const recipient = recipientSnapshot?.docs?.[0]?.data();
    const recipientEmail = getRecipientEmail(chat.users, user);
    return (
        <Container>
            <Header>
                <IconButton onClick={handleClickOpen}>
                    {recipient ? (
                        <Avatar src={recipient?.photoURL} />
                    ) : (
                        <Avatar>{recipientEmail[0]}</Avatar>
                    )}
                </IconButton>
                <HeaderInformation>
                    <h3>{recipient?.name}</h3>
                    {recipientSnapshot ? (
                        <p>Last active: {' '}
                            {recipient?.lastSeen?.toDate() ? (
                                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
                            ) : "Unavailable"}
                        </p>
                    ) : (
                        <p>Loading Last active...</p>
                    )}
                </HeaderInformation>
                <HeaderIcons>
                    <IconButton onClick={handleClickOpenDel}>
                        <DeleteIcon style={{ color: "white" }} />
                    </IconButton>
                </HeaderIcons>
            </Header>

            <MessageContainer>
                {showMessages()}
                <EndOfMessage ref={endOfMessagesRef} />
            </MessageContainer>
            <Dialog open={openEmoji} aria-labelledby="form-dialog-title">
                <DialogActions style={{backgroundColor:'#232423'}}>
                        <CloseIcon style={{color:'white'}} onClick={handleCloseEmoji}/>
                </DialogActions>
                <Emojis onSelect={pickEmoji} showPreview={false} theme={'dark'} perLine={6}
                    showSkinTones={false}/>
            </Dialog>
            <InputContainer>
                <IconButton style={{color:'white',padding:0}}>
                <InsertEmoticonIcon onClick={handleShowEmojis} />
                </IconButton>
                <Input value={input} onChange={handleChange} ref={inputRef} />
                    <IconButton disabled={!input} type="submit" onClick={sendMessage} 
                style={{backgroundColor:'#302401',border:'none',color:'white',padding:0}}><SendIcon /></IconButton>
            </InputContainer>

            {/**Dialog popup for Display Picture!! */}
            <Dialog open={open} aria-labelledby="form-dialog-title">
                <DialogContainer onClick={handleClose}>
                    {recipient ? (
                        <img src={`${recipient?.photoURL}?size=300`} />
                    ) : (
                        <img src={`${recipientEmail[0]}?size=300`} />
                    )}
                </DialogContainer>
            </Dialog>

            {/**Dialog popup for delete chats conversions!! */}
            <Dialog open={openDel} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Delete Chat ?</DialogTitle>
                <DialogActions>
                    <Button onClick={handleCloseDel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={delMessages} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}

export default ChatScreen;

const Emojis = styled(EmojiPicker)`
    width:100%;
    max-height: 100%;
    overflow-y:auto;
    background-color: white;
`;

const Container = styled.div`
    color: white;
`;

const Header = styled.div`
    position: sticky;
    z-index: 100;
    top: 0;
    display: flex;
    padding: 11px;
    height: 80px;
    align-items: center;
    border-bottom: 1px solid whitesmoke;
    background-color: #302401;
`;

const HeaderInformation = styled.div`
    flex: 1;

    >h3{
        margin-bottom: 3px;
        font-family: cursive;
    }

    >p{
        font-size: 14px;
        color: gray;
    }

    @media (max-width: 990px){
        >h3{
            font-size: 17px;
            width: 85%;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        >p{
            font-size: 11px;
        }
    }
`;

const HeaderIcons = styled.div``;

const EndOfMessage = styled.div`
    margin-bottom: 50px;
`;

const MessageContainer = styled.div`
    padding: 30px;
    background-color: #1c1501;
    min-height: 90vh;
    @media (max-width: 990px){
        padding: 15px;
    }
`;

const InputContainer = styled.form`
    display: flex;
    align-items: center;
    padding: 10px;
    position: sticky;
    bottom: 0;
    background-color: #302401;
    color: white;
    z-index: 100;
`;

const Input = styled.input`
    flex:1;
    outline: 0;
    border: none;
    border-radius: 10px;
    background-color:whitesmoke;
    padding: 20px;
    margin-left: 15px;
    margin-right: 15px;

    @media (max-width: 990px){
        padding: 10px;
    }
`;

const DialogContainer = styled(DialogActions)`
    >img{
        width:265px;
    }
`;