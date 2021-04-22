import { Avatar, IconButton, Button } from "@material-ui/core";
import styled from "styled-components";
import ChatIcon from "@material-ui/icons/Chat";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";
import { useState } from "react";
import React from "react";
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';


function Sidebar() {
    const [user] = useAuthState(auth);
    const userChatRef = db.collection('chats').where('users', 'array-contains', user.email);
    const [chatsSnapshot] = useCollection(userChatRef);   //listener
    const [emailInput, setInput] = useState("");
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        createChat();
        setOpen(false);
    };

    const createChat = () => {
        const input = emailInput;

        if (!input) return null;

        if (EmailValidator.validate(input) && !chatAlreadyExists(input) && input !== user.email) {
            //Create a new chat if not already exists and prevent logged user mailing to himself
            db.collection('chats').add({
                users: [user.email, input],
            });
        }
    };
    //Function to check if chat already exists 
    const chatAlreadyExists = (recipientEmail) =>
        !!chatsSnapshot?.docs.find((chat) => chat.data().users
            .find((user) => user === recipientEmail)?.length > 0
        );

    return (
        <Container>
            <Header>
                {/** PROFILE ICON HERE */}
                <UserAvatar src={user.photoURL} onClick={() => auth.signOut()} />
                <h3>{user.displayName}</h3>
                <IconsContainer>
                    {/** CHAT ICON HERE; [CLICKABLE] */}
                    <IconButton>
                        <ChatIcon onClick={handleClickOpen} style={{color :'white'}} />
                    </IconButton>
                </IconsContainer>
            </Header>

            {/** LIST OF CHATS*/}
            {chatsSnapshot?.docs.map((chat) => (
                <Chat key={chat.id} id={chat.id} users={chat.data().users} />
            ))}

            <Dialog open={open} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Connect Chat With...</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" id="name" label="Email Address" type="email"
                        fullWidth value={emailInput} onChange={e => setInput(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleClose} color="primary">
                        Connect
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default Sidebar;

const Container = styled.div`
    flex: 0.40;
    border-right: 1px solid whitesmoke;
    height: 100vh;
    overflow-y: scroll;
    background-color: #302401;
    color: white;

    ::-webkit-scrollbar{
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    @media (max-width: 990px){
        flex: 0.2;
        padding-top:8px;
    }
`;

const Header = styled.div`
    display: flex;
    position: sticky;
    top: 0;
    background-color: #302401;
    z-index: 1;
    justify-content:space-between;
    align-items: center;
    padding: 15px;
    height: 80px;
    border-bottom: 1px solid whitesmoke;

    >h3{
        font-family: cursive;
    }

    @media (max-width: 990px){
        flex-direction: column;
        padding: 5px;
        height: 100px;
        >h3{
            font-size:0;
        }
    }
`;

const UserAvatar = styled(Avatar)`
    cursor: pointer;
    :hover{
        opacity:0.8;
    }
`;

const IconsContainer = styled.div``;

