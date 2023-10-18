import React, { useState , useRef, useEffect } from 'react'
import Client from '../components/Client'
import Editor from '../components/Editor'
import { initSocket } from "../Socket"
import ACTIONS from '../Action'
import toast from 'react-hot-toast'
import {io} from "socket.io-client";
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';



function EditorPage() {

   const[clients , setClients] = useState([])

   const socketRef = useRef(null);
   const codeRef = useRef(null);
   const location = useLocation();
   const reactNavigator = useNavigate();
   const params= useParams();



    useEffect(()=>{


        const init = async()=>{

            socketRef.current = await initSocket(); 

            socketRef.current.on('connect_error' , (err)=> handleErrors(err))
            socketRef.current.on('connect_failed' , (err)=> handleErrors(err))

            socketRef.current.emit(ACTIONS.JOIN , {
                roomId : params.roomId,
                username : location.state?.userName
            });

            //  listning for joined event
            socketRef.current.on(ACTIONS.JOINED ,  ( {clients , username , socketId} )=>{
                if(username !== location.state?.userName){
                    toast.success(`${username} joined the room`);
                }
                else{
                    toast.success(`joined the room`);
                }
                
                setClients(clients);

                // yaha pe naya user join ho chuka h to usko previous data bhejna h hume
                socketRef.current.emit(ACTIONS.SYNC_CODE , {
                    code : codeRef.current,
                    socketId,
                });
            });

            //  listning for dissconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ( {socketId , username} ) =>{

                toast.success(`${username} left the room`);

                //  now we have to remove that user from our clients array
                setClients((prev)=>{
                    return prev.filter(client => client.socketId !== socketId);
                })
                
            })
           

            function handleErrors(err){
                console.log("socket error " , err );
                toast.error("Socket connection failed , try again later :)")
                reactNavigator("/");
            }
        }


        init();


        //  *node always clear all the listners
        return ()=>{
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
            socketRef.current.disconnect();
        }

    }, []);

    function leaveRoom(){
        reactNavigator('/');
    }

    const copyRoomId = async()=>{
        try{
            await navigator.clipboard.writeText(params.roomId);
            toast.success(`Room ID copied`)
        }catch(err){
            toast.error(`could not copy Room ID`)
            console.log(err);
        }
    }




if(!location.state)
{
return <Navigate to="/" />
}

  return (
    <div className='mainwrap'>

        <div className='aside'>
            <div className='asideInner'>

                <div className='logo'>
                    <img className='logoImage' src="/code-sync.png" alt="logo" />
                </div>

                <h3>Connected</h3>

                <div className='clientsList'>
                  {
                    clients.map(client=>{
                        return <Client  key={client.socketId} username={client.username} />
                    })
                  }
                </div>

            </div>

            <button className='btn copyBtn' onClick={copyRoomId}>copy room id</button>
            <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>

        </div>

{/*  building text editor */}
        <div className='editorwrap'>
            <Editor socketRef = {socketRef} roomId = {params.roomId}  onCodeChange= {(code) => codeRef.current = code}   />
        </div>

    </div>
  )
}

export default EditorPage