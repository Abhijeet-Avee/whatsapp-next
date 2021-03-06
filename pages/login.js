import { Button } from "@material-ui/core";
import Head from "next/head";
import styled from "styled-components";
import { auth, provider } from "../firebase";

function Login() {

    const signIn = ()=>{
        auth.signInWithPopup(provider).catch(alert);
    }

    return (
        <Container>
         <Head>
             <title>Login</title>
        </Head>   

        <LoginContainer>
            <Logo
                src = "data:image/jpeg;base64,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"
            />
            <Button onClick={signIn} variant='outlined'>Sign in with Google</Button>
        </LoginContainer>

        </Container>
    )
}

export default Login;

const Container = styled.div`
    display:grid;
    place-items: center;
    height: 100vh;
    background-color:whitesmoke;
`;

const LoginContainer = styled.div`
    padding:40px;
    display:flex;
    flex-direction:column;
    align-items:center;
    background-color:white;
    border-radius: 5px;
    box-shadow: 0px 4px 14px -3px rgba(0,0,0,0.7);
`;

const Logo = styled.img`
    height: 200px;
    width: 200px;
    margin-bottom: 50px;
`;