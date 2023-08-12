import React, { useCallback, useEffect, useState } from 'react'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { io } from 'socket.io-client'
import { useParams } from 'react-router'
export default function TextEditor() {
    const SAVE_INTERVAL_MS = 2000;
    const TOOLBAR_OPTION = [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ script: "sub" }, { script: "super" }],
        [{ align: [] }],
        ["image", "blockquote", "code-block"],
        ["clean"],
    ]
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const {id:documentId} = useParams();
    useEffect(() => {
        const s = io("http://localhost:3001")
        setSocket(s);

        return () => {
            s.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return

        // this handler fn work when some changes occur it's send to the socket 
        // so on server side they can listen it.
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            socket.emit("send-changes", delta);
        }
        // when any text changes in the docs that changes send to the handler function
        quill.on('text-change', handler)

        return () => {
            quill.off('text-changes', handler)
        }
    }, [socket, quill])

    useEffect(()=>{
        if(socket == null || quill == null) return 

        socket.once('load-document', document =>{
            quill.setContents(document)
            quill.enable();
        })
        socket.emit('get-document',documentId);
    },[socket, quill,documentId])


    useEffect(()=>{
        if(socket == null || quill == null){
            return 
        }
        
        const interval = setInterval(()=>{
            socket.emit('save-document',quill.getContents())
        },SAVE_INTERVAL_MS)
        return ()=>{
            clearInterval(interval)
        }

    },[socket,quill])
    // for listening the changes that we are making on another docs file
    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta) => {
            //for updataing quill docs
             quill.updateContents(delta);
        }

        // it's recieve the changes and set to the quill docs
        socket.on('receive-changes', handler)

        return () => {
            socket.off('receive-changes', handler)
        }
    }, [socket, quill])

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return
        wrapper.innerHTML = '';
        const editor = document.createElement('div');
        wrapper.append(editor)
        const q = new Quill(editor, {
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTION
            }
        })
        
        q.disable();
        q.setText('Loading...')
        setQuill(q);

    }, [])
    return (
        <div className='container' ref={wrapperRef}>
        </div>
    )
}
