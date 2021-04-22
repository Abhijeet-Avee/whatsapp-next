import styled from "styled-components";
import {Avatar} from "@material-ui/core";
import getRecipientEmail from "../utils/getRecipientEmail";
import {useAuthState} from "react-firebase-hooks/auth";
import {useCollection} from "react-firebase-hooks/firestore"
import {auth,db} from "../firebase";
import {useRouter} from "next/router";

function Chat({id, users}) {
    const router = useRouter();
    const [user] = useAuthState(auth);
    const [recipientSnapshot] = useCollection(db.collection('users').where('email','==',getRecipientEmail(users,user)));

    const enterChat = ()=> {
        router.push(`/chat/${id}`)
    }

    const recipientEmail = getRecipientEmail(users,user);
    const recipient = recipientSnapshot?.docs?.[0]?.data();

    return (
        <Container onClick={enterChat}>
            {recipient ? (
                <UserAvatar src = {recipient?.photoURL}/>
            ): (
                <UserAvatar>{recipientEmail[0]}</UserAvatar>
            )}
            <p>{recipient?.name} [{recipientEmail}]</p>
        </Container>
    )
}

export default Chat;

const Container = styled.div`
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 15px;
    word-break: break-word;
    font-family: cursive;

    :hover {
        background-color: #1c1501;
    }

    @media (max-width: 990px){
        >p {
            visibility: hidden;
            font-size: 0px;
        }
        padding:0;
    }
`;

const UserAvatar = styled(Avatar)`
    margin: 5px;
    margin-right: 15px;

    @media (max-width: 990px){
        margin:10px;    
    }
`;