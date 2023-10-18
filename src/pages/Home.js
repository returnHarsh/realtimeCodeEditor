import React, { useState } from 'react'
import { v4 as uuidV4 } from 'uuid';
import toast  from 'react-hot-toast';
import {useNavigate} from "react-router-dom";

function Home() {

    const navigate = useNavigate();
    const[roomId , setRoomId] = useState("");
    const[userName , setUserName] = useState("");


    //  creating a new room
    const createNewRoom= (e)=>{
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success("Created a new room id")
    }


    //  join room function
    const joinRoom = () =>{
        if(!roomId || !userName){
            toast.error("ROOM Id or Username is required");
            return;
        }
        //  Redirect
        navigate(`/editor/${roomId}` , {
            state : {
                userName : userName,
            }
        })
    }

    //  enter submit functionality
    const handleInputEnter = (event)=>{
        if(event.code == 'Enter'){
            joinRoom();
        }
        return;
    }


  return (

    <div className='homePageWrapper'>
        <div className='formWrapper'>
            <img src="/code-sync.png" alt="titlePage" className='homePageLogo' />
            <h4 className='mainLabel'>Paste Invitation ROOM ID</h4>

            <div className='inputGroup'>
                <input type="text" className='inputBox' value={roomId}  placeholder='ROOM ID' onChange={(e)=> setRoomId(e.target.value)} onKeyUp={handleInputEnter} />
                <input type="text" className='inputBox'  value={userName} placeholder='USERNAME' onChange={(e)=> setUserName(e.target.value)}   onKeyUp={handleInputEnter} />
                <button className='btn joinBtn' onClick={joinRoom}>Join</button>
                <span className='createInfo'>If you dont have an invite create &nbsp; 
                <a onClick={createNewRoom} href="#" className='createNewBtn'>new room</a>
                </span>
            </div>

        </div>

        <footer>
            <h4>built with💛 by  <a href="#">Harsh</a>   </h4>
        </footer>

    </div>
   
  )
}

export default Home