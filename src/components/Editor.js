import React, { useEffect , useRef} from 'react'
import  CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/sql/sql';
import 'codemirror/mode/swift/swift';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Action';


function Editor( {socketRef , roomId , onCodeChange} ) {

    const editorRef = useRef(null);

    useEffect(()=>{

        async function init(){
            editorRef.current = CodeMirror.fromTextArea(document.getElementById("realtimeEditor") , {
                mode : {name : 'javascript' , json : true},
                theme : 'dracula',
                autoCloseTags: true,
                autoCloseBrackets : true,
                lineNumbers : true,
            });

            //  codemirror ki event
            editorRef.current.on("change" , (instance , changes) =>{
                const {origin} = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if(origin != 'setValue'){
                    socketRef.current.emit(ACTIONS.CODE_CHANGE , {
                        roomId,
                        code
                    })
                }
            })
        }

        init();

        const codemirrors = document.querySelectorAll(".CodeMirror ");
        let length = codemirrors.length;
        for(let i = 0 ; i<length ; i++)
        {
            if(i > 0)
            {
                codemirrors[i].remove();
            }
        }

    

    },[])

    useEffect(()=>{
        if(socketRef.current){
            socketRef.current.on(ACTIONS.CODE_CHANGE , code=>{
                editorRef.current.setValue(code);
            })
        }

        return ()=>{
            socketRef.current.off(ACTIONS.CODE_CHANGE)
        }


    }, [socketRef.current])

    return <textarea  id="realtimeEditor" ></textarea>
}

export default Editor